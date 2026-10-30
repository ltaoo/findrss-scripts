/*
MIT License

Copyright (c) 2026 ltaoo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import { ClipScript, Result } from "@findrss/core";
export const kind = "clip";
export const version = "1.0.0";
export const platform = {"name":"百度","icon":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"baidu-hot-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,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\" data-n=\"baidu-hot-favicon\"/></svg>"};

const baidu_cookie = "BIDUPSID=BE84C35CDC0C4D412532306225EE7B4A; PSTM=1753240099; BAIDUID=BE84C35CDC0C4D4175FDC152EC85BFFE:FG=1; BDUSS=zIxZHNZU0N6cVM0M1VNQ3B1a3luZUI5RkFhZEVnLUJReVJ6MVJHbGs0UVh3Y3hvSVFBQUFBJCQAAAAAAAAAAAEAAABTLE6TbHRhb29fbwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABc0pWgXNKVoY; BDUSS_BFESS=zIxZHNZU0N6cVM0M1VNQ3B1a3luZUI5RkFhZEVnLUJReVJ6MVJHbGs0UVh3Y3hvSVFBQUFBJCQAAAAAAAAAAAEAAABTLE6TbHRhb29fbwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABc0pWgXNKVoY; H_WISE_SIDS_BFESS=63148_64008_65311_66220_66283_66393_66529_66587_66583_66590_66604_66653_66677_66671_66694_66744_66616_66787_66802_66806_66852_66856_66599_66606_66879_66888; MCITY=-179%3A; BD_UPN=123253; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598; BAIDUID_BFESS=BE84C35CDC0C4D4175FDC152EC85BFFE:FG=1; BA_HECTOR=ak04ak208ha08085202l04200h21ag1l3n0o029; ZFY=P9lXtKwGr6aLwdwpWRUwWxB9B0Yp8tfRFGDjUnX4fXE:C; delPer=0; BD_CK_SAM=1; PSINO=5; SMARTINPUT=%5Bobject%20Object%5D; minjie_card=1; COOKIE_SESSION=2462760_0_8_8_14_33_1_1_6_6_1_6_2462791_0_20_0_1770824244_0_1770824224%7C8%230_0_1782285063%7C1%7C1; H_PS_PSSID=63148_67721_67862_69005_69294_69594_70117_70547_70972_70997_71033_71043_71048_71093_71102_71152_71144_71139_71189_71198_71194_71193_71209_71201_71207_71205_71196_71214_71217_71228_71245_71272_71278_71274_71304_71321_71338_71351_71365_71354; H_WISE_SIDS=63148_67721_67862_69005_69294_69594_70117_70547_70972_70997_71033_71043_71048_71093_71102_71139_71189_71198_71194_71193_71209_71201_71207_71205_71196_71214_71217_71228_71245_71272_71278_71274_71304_71321_71338_71351_71365_71354";

const text = value => typeof value === "string" ? value.trim() : typeof value === "number" && Number.isFinite(value) ? String(value) : "";
const join = (...values) => values.map(text).filter(Boolean).join(" ");
const temperature = value => text(value) ? /[°℃]/.test(text(value)) ? text(value) : text(value) + "°" : "—";
const humidity = value => text(value) ? /[%％]/.test(text(value)) ? text(value) : text(value) + "%" : "—";
const symbol = condition => /雷/.test(condition) ? "⛈" : /雪/.test(condition) ? "❄" : /雨/.test(condition) ? "🌧" : /雾|霾/.test(condition) ? "🌫" : /多云/.test(condition) ? "⛅" : /阴|云/.test(condition) ? "☁" : /晴/.test(condition) ? "☀" : "—";

function parse_data(raw) {
  try { return JSON.parse(raw); }
  catch {
    // 百度 s-data 偶尔带有 \- 等非标准 JSON 转义，保留合法转义并移除这些多余反斜线。
    return JSON.parse(raw.replace(/\\(?:["\\/bfnrtu]|([^]))/g, (sequence, invalid) => invalid === undefined ? sequence : invalid));
  }
}

function template_weather(value) {
  if (value?.commonParams?.tpl !== "weather_forecast_new_san") return null;
  const days = Array.isArray(value.dayForecastList) ? value.dayForecastList : [];
  const selected = Number(value.selectedDayIndex ?? 0);
  const index = Number.isInteger(selected) && selected >= 0 && selected < days.length ? selected : 0;
  const day = days[index] || {};
  const hours = value.hourInfoData?.dataList;
  const hour = Array.isArray(hours) ? hours[Number(value.hourInfoData.current)] || hours[0] || {} : {};
  const observe = value.observe || {};
  const weather = {
    city: text(value.curLoc) || text(observe.site) || text(value.tplInfo?.word),
    temperature: text(observe.temperature) || text(hour.temperature)
      || [text(day.temperature_night), text(day.temperature_day)].filter(Boolean).join("~"),
    apparent: text(observe.real_feel_temperature) || text(observe.bodytemp_info),
    condition: text(observe.weather) || text(day.weather_today) || text(day.weather_day) || text(day.weather_night),
    wind: join(observe.wind_direction, observe.wind_power) || join(day.wind_direction, day.wind_power) || join(hour.windDirectionText, hour.windPower),
    humidity: text(observe.humidity) || text(day.humidity?.text) || text(day.humidity?.tip),
    forecast: days.slice(index).filter(day => day && typeof day === "object"
      && [day.weather_today, day.weather_day, day.weather_night, day.temperature_day, day.temperature_night].some(value => text(value)))
      .slice(0, 3).map((day, index) => ({
        label: text(day.word) || ["今天", "明天", "后天"][index], date: text(day.date),
        condition: text(day.weather_today) || text(day.weather_day) || text(day.weather_night),
        high: text(day.temperature_day), low: text(day.temperature_night),
      })),
  };
  return [weather.city, weather.temperature, weather.condition].filter(Boolean).length >= 2 ? weather : null;
}

function field(value, names) {
  for (const name of names) if (text(value[name])) return text(value[name]);
  for (const [key, item] of Object.entries(value)) {
    if (names.some(name => key.toLowerCase() === name.toLowerCase() || /[\u4e00-\u9fff]/.test(name) && key.includes(name)) && text(item)) return text(item);
  }
  return "";
}

function generic_weather(values) {
  const pending = [...values];
  let best = null, score = 0, city = "";
  while (pending.length) {
    let value = pending.pop();
    if (typeof value === "string" && /^[\[{]/.test(value.trim())) {
      try { value = JSON.parse(value); } catch { continue; }
    }
    if (!value || typeof value !== "object") continue;
    pending.push(...Object.values(value).filter(item => item && (typeof item === "object" || typeof item === "string" && /^[\[{]/.test(item.trim()))));
    if (Array.isArray(value)) continue;
    const found_city = field(value, ["city", "cityName", "city_name", "location", "area", "district", "城市", "地区", "位置"]);
    city ||= found_city;
    const weather = {
      city: found_city,
      temperature: field(value, ["temperature", "temp", "tempNow", "currentTemp", "nowTemp", "tmp", "realTemp", "temperatureValue", "温度", "气温"]),
      apparent: field(value, ["apparentTemperature", "feelsLike", "realFeel", "bodyTemp", "体感"]),
      condition: field(value, ["weather", "weatherText", "weatherDesc", "weather_desc", "condition", "text", "wea", "dayWeather", "nightWeather", "天气"]),
      wind: field(value, ["wind", "windDirection", "windPower", "windClass", "windScale", "windSpeed", "风向", "风力", "风速"]),
      humidity: field(value, ["humidity", "rh", "sd", "湿度"]), forecast: [],
    };
    if ([weather.city, weather.temperature, weather.condition].filter(Boolean).length < 2) continue;
    if (!weather.temperature && !/晴|云|阴|雨|雪|雾|霾|沙|风|霰|冰|雷/.test(weather.condition)) continue;
    const current_score = (weather.city ? 2 : 0) + (weather.temperature ? 3 : 0) + (weather.condition ? 3 : 0)
      + [weather.apparent, weather.wind, weather.humidity].filter(Boolean).length;
    if (current_score > score) { best = weather; score = current_score; }
  }
  if (best && !best.city) best.city = city;
  return best;
}

function weather_model(html, city) {
  if (/wappass\.baidu\.com\/static\/captcha|tuxing_v2\.html|verify\.baidu\.com|百度安全验证/i.test(html)) {
    return Result.Err("百度返回了验证页面，请更新脚本中的 Cookie 后重试", "UPSTREAM_ACCESS_DENIED");
  }
  const values = [];
  for (const [, raw] of html.matchAll(/<!--s-data:([\s\S]*?)-->/g)) {
    try { values.push(parse_data(raw.trim())); } catch {}
  }
  const weather = values.map(template_weather).find(Boolean) || generic_weather(values);
  if (!weather) return Result.Err("百度搜索结果中未找到天气数据，请检查城市或更新 Cookie", "UPSTREAM_INVALID_RESPONSE");
  weather.city = (weather.city || city).replace(/天气$/, "").trim() || "本地";
  weather.temperature = temperature(weather.temperature);
  weather.apparent = temperature(weather.apparent);
  weather.humidity = humidity(weather.humidity);
  weather.wind ||= "—";
  weather.condition ||= "暂无天气描述";
  weather.symbol = symbol(weather.condition);
  weather.updated_at = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16).replace("T", " ");
  weather.forecast = weather.forecast.map(day => ({ ...day, high: temperature(day.high), low: temperature(day.low), symbol: symbol(day.condition) }));
  return Result.Ok(weather);
}

const escape = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

function render_weather(weather) {
  return `<section data-n="baidu-weather" style="box-sizing:border-box;max-width:640px;padding:24px;border:1px solid #dce5f0;border-radius:18px;background:#f4f8fd;color:#21334c;font:15px/1.6 system-ui,sans-serif">
    <header data-n="weather-header" style="display:flex;justify-content:space-between;align-items:center;gap:16px"><h1 data-n="weather-city" style="margin:0;font-size:22px">${escape(weather.city)}天气</h1><span data-n="weather-provider" style="color:#596b82;font-size:13px">百度天气</span></header>
    <div data-n="current-weather" style="display:flex;align-items:center;gap:20px;margin:24px 0"><span data-n="weather-symbol" aria-hidden="true" style="font-size:54px">${weather.symbol}</span><div data-n="current-conditions"><p data-n="current-temperature" style="margin:0;font-size:52px;line-height:1.15;font-weight:650">${escape(weather.temperature)}</p><p data-n="current-condition" style="margin:6px 0 0">${escape(weather.condition)}</p></div></div>
    <dl data-n="weather-details" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 24px">${[["apparent", "体感", weather.apparent], ["humidity", "湿度", weather.humidity], ["wind", "风", weather.wind]].map(([name, label, value]) => `<div data-n="${name}-detail"><dt data-n="${name}-label" style="color:#596b82;font-size:13px">${label}</dt><dd data-n="${name}-value" style="margin:4px 0 0;overflow-wrap:anywhere">${escape(value)}</dd></div>`).join("")}</dl>
    <section data-n="weather-forecast" aria-label="未来三天天气" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">${weather.forecast.map(day => `<article data-n="forecast-day" style="min-width:0;padding:14px 10px;border-radius:12px;background:#fff;text-align:center"><strong data-n="forecast-label">${escape(day.label)}</strong><p data-n="forecast-date" style="margin:2px 0;color:#596b82;font-size:12px">${escape(day.date)}</p><span data-n="forecast-symbol" aria-hidden="true" style="font-size:30px">${day.symbol}</span><p data-n="forecast-condition" style="margin:4px 0">${escape(day.condition)}</p><p data-n="forecast-temperature" style="margin:0"><strong data-n="forecast-high">${escape(day.high)}</strong><span data-n="forecast-low" style="margin-left:8px;color:#596b82">${escape(day.low)}</span></p></article>`).join("") || '<p data-n="empty-forecast" style="grid-column:1/-1;margin:0;color:#596b82">暂无预报</p>'}</section>
    <footer data-n="weather-updated" style="margin-top:18px;color:#596b82;font-size:12px">更新 ${weather.updated_at}（北京时间）</footer>
  </section>`;
}

class BaiduWeatherClip extends ClipScript {
  async fetch(ctx) {
    const city = String(ctx.params.city ?? "").trim();
    if (city.length > 40 || /[\u0000-\u001f\\/<>?#&]/.test(city)) return Result.Err("城市名称无效", "INVALID_PARAMETER");
    const link = "https://www.baidu.com/s?ie=UTF-8&wd=" + encodeURIComponent(city + "天气");
    const response = await ctx.fetchText(link, { timeout_ms: 10000, headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8", "Cache-Control": "max-age=0",
      Referer: "https://www.baidu.com/",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
      Cookie: baidu_cookie,
    } });
    if (response.error) return response;
    const parsed = weather_model(response.data, city);
    if (parsed.error) return parsed;
    return Result.Ok({ title: parsed.data.city + "天气", link, html: render_weather(parsed.data) });
  }
}

const script = new BaiduWeatherClip();
export const route = {
  path: "/baidu/s/weather/:city?", name: "百度天气", url: "www.baidu.com",
  example: "/baidu/s/weather/上海", parameters: { city: "城市或区县名称，省略时使用百度定位" },
  description: "参考 wizm 天气 App，剪藏百度当前天气、体感、湿度、风力及未来三天预报；Cookie 内置于脚本，无需浏览器绑定。",
  handler: ctx => script.run(ctx),
};
