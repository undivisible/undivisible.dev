#!/usr/bin/env bash
set -euo pipefail
export AGENT_BROWSER_SESSION="weather-state-$$"
trap 'agent-browser close >/dev/null 2>&1 || true' EXIT
agent-browser --init-script "$(dirname "$(realpath "$0")")/weather-state.js" open "${1:-http://localhost:4321}" >/dev/null
agent-browser set viewport 1280 800 2 >/dev/null
agent-browser set media dark reduced-motion >/dev/null
agent-browser eval 'if(!matchMedia("(prefers-reduced-motion: reduce)").matches)throw new Error("Reduced motion not configured")' >/dev/null
agent-browser wait --fn 'window.weatherFixture?.pending.length === 1' >/dev/null
agent-browser eval '(() => {
  const label = document.querySelector("[aria-controls=weather-preview]").textContent;
  if (label !== "KUL WEATHER LOADING") throw new Error("Pending weather appeared failed: " + label);
  const trigger = document.querySelector("[aria-controls=weather-preview]").parentElement;
  if(trigger.children.length!==1 || trigger.firstElementChild.tagName!=="BUTTON" || trigger.textContent.includes("[forecast]")) throw new Error("Redundant weather control");
  const url = new URL(weatherFixture.pending[0].url);
  if(url.searchParams.get("latitude") !== "3.139" || url.searchParams.get("longitude") !== "101.6869") throw new Error("Wrong city");
  return "PASS cold request displays KUL loading, not unavailable";
})()'
agent-browser hover '[data-time-scrubber]' >/dev/null
agent-browser wait '.landing-solar canvas' >/dev/null
agent-browser eval 'window.pendingSky = document.querySelector(".landing-solar canvas").toDataURL(); weatherFixture.complete(200, {current: {time:1795011300,interval:900,temperature_2m:29.4,weather_code:95,rain:3.2,apparent_temperature:32.1,relative_humidity_2m:87,wind_speed_10m:4.8},hourly:{time:[1795010400,1795014000,1795017600],temperature_2m:[29.4,27.3,26.1],precipitation_probability:[90,75,58],precipitation:[3.2,0.4,0.1],weather_code:[95,55,3]}})' >/dev/null
agent-browser wait --fn 'document.querySelector("[aria-controls=weather-preview]").textContent === "KUL 29°C STORMY"' >/dev/null
agent-browser eval '(async()=>{
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  if(document.querySelector(".landing-solar canvas").toDataURL()===window.pendingSky) throw new Error("Success did not update active solar/weather canvas");
  return "PASS delayed success updates label and active static solar/weather scene";
})()'
agent-browser mouse move 1200 750 >/dev/null
agent-browser focus '[aria-controls=weather-preview]' >/dev/null
agent-browser press Enter >/dev/null
agent-browser wait '#weather-preview .weather-hour' >/dev/null
agent-browser eval '(() => {
  const card=document.querySelector("#weather-preview");
  if(!card.querySelector(".weather-actions a").href.startsWith("https://open-meteo.com/en/docs#latitude=3.139&longitude=101.6869")) throw new Error("Wrong city forecast source");
  if(document.activeElement!==card)throw new Error("Keyboard entry did not reach forecast");
  const hours=[...card.querySelectorAll(".weather-hour")];
  if(hours.length!==2||!hours[0].textContent.includes("27.3°")||!hours[0].textContent.includes("75% rain")||!hours[0].textContent.includes("0.40 mm")||!hours[1].textContent.includes("26.1°"))throw new Error("Forecast values misaligned");
  if(hours[0].querySelector("time").textContent!=="Wed 23:00")throw new Error("Forecast not in Kuala Lumpur time");
  if(!card.textContent.includes("last 15 min")||!card.textContent.includes("4.8 km/h"))throw new Error("Stats units missing");
  const rain=card.querySelector(".weather-window-rain");
  if(card.querySelectorAll(".weather-window-rain").length!==1||rain.parentElement!==card||getComputedStyle(rain).pointerEvents!=="none")throw new Error("Rain must share one non-intercepting window scene");
  if([...card.querySelectorAll(".weather-condition-icon")].some(icon=>icon.src.includes("/animated/")))throw new Error("Reduced motion loaded animated Meteocons");
  if(card.textContent.toLowerCase().includes("rain totals and chance cover"))throw new Error("Removed carousel helper copy returned");
  if(getComputedStyle(card.querySelector(".weather-forecast")).maskImage==="none")throw new Error("Carousel edge fades missing");
  if(document.querySelector(".landing-solar"))throw new Error("Forecast activated clock scene");
  if(!card.querySelector(".weather-solar-marker")||card.querySelectorAll(".weather-solar-times time").length!==2||!card.querySelector(".weather-solar-diagram").getAttribute("aria-label").includes("Sun above the horizon"))throw new Error("Daylight graph lost sun position or local solar times");
  return "PASS forecast values, MYT timestamps, accumulation units and keyboard entry";
})()'
for size in "1280 800" "390 844" "320 740"; do
  read -r width height <<< "$size"
  agent-browser set viewport "$width" "$height" 2 >/dev/null
  agent-browser eval '(async () => {
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const card=document.querySelector("#weather-preview"), tabs=card.querySelector("[role=tablist]"), close=card.querySelector(".status-preview-close"), panel=card.querySelector("[role=tabpanel]");
    const c=card.getBoundingClientRect(), t=tabs.getBoundingClientRect(), x=close.getBoundingClientRect(), p=panel.getBoundingClientRect();
    if(getComputedStyle(card).padding!=="0px"||Math.abs(t.top-c.top-1)>1||Math.abs(t.left-c.left-1)>1||Math.abs(x.top-t.top)>1||Math.abs(t.right-x.left)>1||Math.abs(p.top-t.bottom)>1||Math.abs(p.left-t.left)>1||Math.abs(p.right-x.right)>1)throw new Error("Window tabs/close/page are not edge-to-edge in one header row");
    if(x.width<44||x.height<44||x.right>innerWidth||x.top<0||x.bottom>innerHeight)throw new Error("Close target clipped or too small");
    if(card.textContent.includes("model forecast, not a station reading")||card.textContent.includes("Icons by"))throw new Error("Bottom explanatory text returned");
    if(document.documentElement.scrollWidth>innerWidth)throw new Error("Page overflows narrow width");
    card.scrollTop=card.scrollHeight;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const pinned=close.getBoundingClientRect();
    if(Math.abs(pinned.top-card.getBoundingClientRect().top-1)>1||document.elementFromPoint(pinned.left+pinned.width/2,pinned.top+pinned.height/2)!==close)throw new Error("Close is unreachable after scrolling weather page");
    return `PASS edge-to-edge window, shared tab/close row, no footer copy or overflow at ${innerWidth}px`;
  })()'
  agent-browser click '#weather-preview .status-preview-close' >/dev/null
  agent-browser eval 'if(document.querySelector("#weather-preview")||document.activeElement?.getAttribute("aria-controls")!=="weather-preview")throw new Error("Close control failed to dismiss and restore trigger focus")' >/dev/null
  agent-browser click '[aria-controls=weather-preview]' >/dev/null
  agent-browser wait '#weather-preview .weather-hour' >/dev/null
done
agent-browser set viewport 1280 800 2 >/dev/null
agent-browser focus '#weather-city-kl' >/dev/null
agent-browser press ArrowRight >/dev/null
agent-browser wait --fn 'weatherFixture.pending.length === 1' >/dev/null
agent-browser eval '(() => {
  const tab=document.querySelector("#weather-city-hk"), panel=document.querySelector("[role=tabpanel]");
  if(document.querySelectorAll("[role=tab]").length!==5||document.querySelectorAll("[role=tab][tabindex=\"0\"]").length!==1||document.activeElement!==tab||tab.getAttribute("aria-selected")!=="true"||panel.getAttribute("aria-labelledby")!==tab.id)throw new Error("City tab selection/focus/panel relationship failed");
  if(!weatherFixture.pending[0].url.includes("latitude=22.3193")||panel.getAttribute("aria-busy")!=="true"||panel.querySelector(".weather-forecast"))throw new Error("City switch reused previous forecast or wrong request");
  weatherFixture.complete(200,{current:{time:1795011300,is_day:0,temperature_2m:18,weather_code:0,rain:0},daily:{sunrise:[1794956400,1795042800],sunset:[1794999600,1795086000]}});
})()' >/dev/null
agent-browser wait --fn 'document.querySelector("#weather-city-panel .weather-reading")?.textContent.includes("18°C")' >/dev/null
agent-browser eval '(() => {
  const card=document.querySelector("#weather-preview");
  if(card.querySelector(".weather-solar-marker")||!card.querySelector(".weather-solar-state").textContent.includes("sun below horizon")||card.querySelectorAll(".weather-solar-times time").length!==2)throw new Error("Night graph fabricated a sun position or lost solar times");
  return "PASS distinct daytime sun and honest below-horizon night graph with sunrise/sunset";
})()'
agent-browser press Tab >/dev/null
agent-browser eval 'if(document.activeElement?.id!=="weather-city-panel")throw new Error("Tab did not leave the tablist for its panel")' >/dev/null
agent-browser focus '#weather-city-hk' >/dev/null
agent-browser press End >/dev/null
agent-browser eval 'if(document.activeElement?.id!=="weather-city-tokyo"||document.activeElement.getAttribute("aria-selected")!=="true")throw new Error("End did not select last city")' >/dev/null
agent-browser press Home >/dev/null
agent-browser press ArrowLeft >/dev/null
agent-browser eval 'if(document.activeElement?.id!=="weather-city-tokyo")throw new Error("Left arrow did not wrap to last city")' >/dev/null
agent-browser press ArrowRight >/dev/null
agent-browser eval 'if(document.activeElement?.id!=="weather-city-kl"||document.activeElement.getAttribute("aria-selected")!=="true")throw new Error("Right arrow did not wrap to first city");"PASS city tab ARIA, keyboard selection/wrap/Home/End, loading isolation and tab-to-panel focus"'
agent-browser press Escape >/dev/null
agent-browser eval 'if(document.querySelector("#weather-preview")||document.activeElement?.getAttribute("aria-controls")!=="weather-preview")throw new Error("Escape failed to dismiss and restore focus")' >/dev/null
agent-browser reload >/dev/null
agent-browser wait --fn 'window.weatherFixture?.pending.length === 1' >/dev/null
agent-browser eval 'weatherFixture.complete(503, {error:true})' >/dev/null
agent-browser wait --fn 'document.querySelector("[aria-controls=weather-preview]").textContent === "KUL WEATHER UNAVAILABLE"' >/dev/null
agent-browser eval 'window.dispatchEvent(new Event("online"))' >/dev/null
agent-browser wait --fn 'weatherFixture.pending.length === 1' >/dev/null
agent-browser eval 'weatherFixture.complete(200,{current:{temperature_2m:24.5,weather_code:55,rain:0.3}})' >/dev/null
agent-browser wait --fn 'document.querySelector("[aria-controls=weather-preview]").textContent === "KUL 25°C RAINY"' >/dev/null
agent-browser eval 'if(document.querySelector(".landing-solar"))throw new Error("Weather recovery activated background at idle");"PASS settled HTTP failure and online recovery without reload"'
