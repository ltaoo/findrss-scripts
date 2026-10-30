import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { read_script, script_names } from './support/script_sources.js';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { DOUYIN_SDK_FILES } from 'findrss-worker/server/infra/douyin_sdk.js';
import { KUAISHOU_SDK_FILE } from 'findrss-worker/server/infra/kuaishou_sdk.js';
import { ScriptCookieAccess } from 'findrss-worker/server/infra/script_cookie_access.js';
import { FeedModel } from 'findrss-worker/server/domain/feed_format.js';
import { RssRoutePatternModel } from 'findrss-worker/server/domain/rss_route.js';
import { mock_tcp_http } from 'findrss-worker/test/support/tcp_socket_fixture.js';

const { compile_script_module, execute_script } = await import('findrss-worker/server/infra/script_sandbox.js');
const fixture_directory = new URL('./fixtures/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('newsnow_sources.json', fixture_directory)));
const fixtures = JSON.parse(await readFile(new URL('newsnow_responses.json', fixture_directory)));
const content_cases = JSON.parse(await readFile(new URL('./fixtures/script_migration.json', import.meta.url)));
const read = read_script;
const hash = (kind, value) => createHash(kind).update(value).digest('hex');

test('源码目录包含完整 Hot/RSS 脚本，分类与路由经生产 QuickJS 校验', async () => {
  assert.equal(script_names('hot').length, 76);
  assert.equal(script_names('rss').length, 23);
  for (const kind of ['hot', 'rss']) for (const name of script_names(kind)) {
    const source = read(kind + '/' + name);
    assert.match(source, kind === 'rss' ? /extends RSSScript/ : /extends HotRankScript/);
    const compiled = await compile_script_module(source);
    assert.equal(compiled.error, '', kind + '/' + name);
    assert.equal(compiled.metadata.kind, kind, name);
    assert.ok(compiled.metadata.routes.length, name);
  }
});


for (const fixture of content_cases) test('迁移脚本保留内容与媒体：' + fixture.file + (fixture.route_index ? (fixture.file === 'zhihu' ? ' 回答' : fixture.file === 'bilibili' ? ' 视频' : ' 正文代理') : ''), async t => {
  if (fixture.file === 'bilibili') mock_tcp_http(t);
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const kind = fixture.kind || 'rss';
  const source = await read(kind + '/' + fixture.file + '.js');
  const compiled = await compile_script_module(source);
  assert.equal(compiled.error, '');
  const metadata = { ...compiled.metadata, ...compiled.metadata.routes[fixture.route_index || 0], config: fixture.config || {} };
  const calls = [];
  globalThis.fetch = async (url, options) => {
    if (url === KUAISHOU_SDK_FILE.url) return new Response(gunzipSync(await readFile(new URL('./fixtures/kuaishou/web-sdk.js.gz', import.meta.url))));
    const sdk_index = DOUYIN_SDK_FILES.findIndex(file => file.url === url);
    if (sdk_index >= 0) return new Response(gunzipSync(await readFile(new URL('./fixtures/douyin/' + ['bdms.js.gz','security.js.gz'][sdk_index], import.meta.url))));
    calls.push({ url, options });
    const response = fixture.responses.find(response => url.includes(response.contains));
    assert.ok(response, fixture.file + ': ' + url);
    return new Response(response.body);
  };
  const permissions = compiled.metadata.permissions;
  const access = permissions.cookies.length ? new ScriptCookieAccess({ permissions, assert_grant: () => {}, cookies: () =>
    permissions.cookies.flatMap(permission => permission.names.map(name => ({ name, value: name === 'UIFID' ? 'provider-fixture' : 'test-cookie',
      domain: new URL(permission.origin).hostname, path: '/', secure: true }))) }) : null;
  const result = await execute_script(source, metadata, fixture.invoke ? async spec => {
    assert.equal(spec.method, fixture.invoke.method);
    return fixture.invoke.body;
  } : null, { method: 'GET', pathname: metadata.example, params: fixture.params, query: {}, public_origin: 'https://feeds.example' }, [], '', access);
  const value = JSON.parse(result.output);
  if (fixture.expect_body) {
    assert.match(value.body, new RegExp(fixture.expect_body));
    assert.equal(value.content_type, 'text/html; charset=utf-8');
    return;
  }
  const items = kind === 'hot' ? value.entries : value.items;
  assert.ok(items.length > 0, fixture.file);
  assert.equal(new Set(items.map(item => item.id)).size, items.length);
  if (fixture.expected_ids) assert.deepEqual(items.map(item => item.id), fixture.expected_ids, fixture.file);
  if (kind === 'rss') {
    assert.equal(value.kind, 'rss');
    for (const format of ['rss','atom']) assert.match(FeedModel(value).render(format), new RegExp(items[0].id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/&/g,'&amp;')));
    assert.ok(items.every(item => !('rank' in item)));
  } else {
    assert.equal(value.kind, 'hot_rank');
    assert.equal('items' in value, false);
  }
  if (fixture.file === 'youtube') {
    const estimated = Date.parse(items[0].published);
    assert.ok(Math.abs(Date.now() - 4 * 86400000 - estimated) < 10000, '根据 4天前 估算发布时间');
    assert.equal(value.updated, items[0].published);
  }
  if (fixture.file === 'bilibili' && !fixture.route_index) assert.equal(items[0].images.length, 2);
  if (fixture.file === 'bilibili' && fixture.route_index === 1) assert.equal(items[0].enclosure.length, 456);
  if (fixture.file === 'douyin') { assert.equal(items[1].images.length, 2); assert.equal(items[0].media_group, true); }
  if (fixture.file === 'wxchannels') { assert.equal(items[0].live_photos[0].key, 'photo-key'); assert.equal(items[1].enclosure.key, 'key-1'); }
  if (fixture.file === 'wxmp') assert.equal(items[0].live_photos[0].key, 'live-key');
  if (fixture.file === 'x') assert.equal(items[0].enclosure.url, 'https://video.twimg.com/high.mp4');
  if (fixture.file === 'weibo') { assert.ok(items[0].images[0].includes('/img/weibo?')); assert.doesNotMatch(items[0].content, /\[object Object\]/); }
});

test('52 个源重写为列表快照，生产 QuickJS 正常执行、去重并保留稳定 ID 和链接', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  for (const entry of manifest.sources) {
    const file = entry.file.replace(/^(36kr|bilibili|chongbuluo|cls|fastbull|wallstreetcn)_.+\.js$/, '$1.js');
    const script = await read('hot/' + file);
    const compiled = await compile_script_module(script);
    assert.equal(compiled.error, '', entry.file);
    const route = compiled.metadata.routes.find(route => route.name === entry.name);
    assert.ok(route, entry.source + ': 未找到同名路由');
    const metadata = { ...compiled.metadata, ...route };
    const fixture = fixtures[entry.source];
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url, options });
      if (entry.source.startsWith('cls-')) {
        const query = new URL(url).searchParams;
        const signature = query.get('sign');
        query.delete('sign');
        assert.equal(signature, hash('md5', hash('sha1', query.toString())));
      }
      if (entry.source === 'qqvideo-tv-hotsearch') {
        assert.equal(options.method, 'POST');
        assert.equal(JSON.parse(options.body).page_params.rank_name, 'HotSearch');
      }
      return new Response(fixture.body);
    };
    const permissions = compiled.metadata.permissions;
    const access = permissions.cookies.length ? new ScriptCookieAccess({ permissions, assert_grant: () => {}, cookies: () => [] }) : null;
    const result = await execute_script(script, metadata, null, undefined, [], '', access).catch(error => {
      error.message = entry.file + ': ' + error.message;
      throw error;
    });
    const snapshot = JSON.parse(result.output);
    assert.equal(snapshot.kind, 'hot_rank', entry.file);
    assert.ok(snapshot.entries.length > 0, entry.file);
    assert.equal(new Set(snapshot.entries.map(row => row.id)).size, snapshot.entries.length, entry.file);
    const expected = snapshot.entries.find(row => row.link === fixture.link);
    assert.ok(expected, entry.file + ': ' + fixture.link);
    assert.equal(expected.title, fixture.title, entry.file);
    assert.equal('items' in snapshot, false);
    assert.ok(snapshot.entries.every(row => !('published' in row) && !('updated' in row)));
    assert.ok(Number.isFinite(Date.parse(snapshot.observed_at)));
    assert.equal(calls.length, fixture.requests || 1, entry.file);
  }
});

test('迁移脚本透传请求失败 Result，不把错误当作空列表成功输出', async () => {
  for (const kind of ['hot', 'rss']) for (const name of script_names(kind)) {
    const original = await read(kind + '/' + name);
    const fixture = content_cases.find(fixture => fixture.file + '.js' === name);
    const script = original + `
const test_routes = typeof routes === 'undefined' ? [route] : routes;
for (const test_route of test_routes) {
  const handler = test_route.handler;
  test_route.handler = ctx => handler({ ...ctx, config: { api_key: 'fixture', advertiser_id: 'fixture', access_token: 'fixture', api_url: 'https://api.example.test', auth_token: 'fixture' },
    fetchText: async () => Result.Err('请求失败', 'UPSTREAM_TIMEOUT'),
    invoke: async () => Result.Err('设备不可用', 'DEVICE_UNAVAILABLE'),
    cookies: { get: async () => Result.Ok({ id: 'fixture-cookie' }) },
  });
}`;
    const compiled = await compile_script_module(script);
    assert.equal(compiled.error, '', name);
    for (const route of kind === 'hot' ? compiled.metadata.routes : compiled.metadata.routes.slice(0, 1)) {
      const url = new URL(route.example, 'https://fixture.invalid');
      const params = fixture?.params || RssRoutePatternModel(route.path).match(url.pathname).params;
      await assert.rejects(execute_script(script, { ...compiled.metadata, ...route, config: name === 'youtube_hot.js' ? { api_key: 'fixture' } : fixture?.config || {} }, null, { method: 'GET', pathname: url.pathname, params, query: Object.fromEntries(url.searchParams) }), error => {
        assert.ok(error.message, name);
        assert.match(error.message, /请求失败|设备不可用/, name);
        return true;
      }, name);
    }
  }
});
