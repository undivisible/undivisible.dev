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
  const label = document.querySelector(".personal-clock a").textContent;
  if (label !== "KUL WEATHER LOADING") throw new Error("Pending weather appeared failed: " + label);
  const url = new URL(weatherFixture.pending[0].url);
  if(url.searchParams.get("latitude") !== "3.139" || url.searchParams.get("longitude") !== "101.6869") throw new Error("Wrong city");
  return "PASS cold request displays KUL loading, not unavailable";
})()'
agent-browser hover '[data-time-scrubber]' >/dev/null
agent-browser wait '.landing-solar canvas' >/dev/null
agent-browser eval 'window.pendingSky = document.querySelector(".landing-solar canvas").toDataURL(); weatherFixture.complete(200, {current: {time:1795011300,interval:900,temperature_2m:29.4,weather_code:95,rain:3.2,apparent_temperature:32.1,relative_humidity_2m:87,wind_speed_10m:4.8},hourly:{time:[1795010400,1795014000,1795017600],temperature_2m:[29.4,27.3,26.1],precipitation_probability:[90,75,58],precipitation:[3.2,0.4,0.1],weather_code:[95,55,3]}})' >/dev/null
agent-browser wait --fn 'document.querySelector(".personal-clock a").textContent === "KUL 29°C STORMY"' >/dev/null
agent-browser eval '(async()=>{
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  if(document.querySelector(".landing-solar canvas").toDataURL()===window.pendingSky) throw new Error("Success did not update active solar/weather canvas");
  if(document.querySelector(".personal-clock a").href!=="https://openweathermap.org/city/1735161") throw new Error("Wrong destination");
  return "PASS delayed success updates label and active static solar/weather scene";
})()'
agent-browser mouse move 1200 750 >/dev/null
agent-browser focus '[aria-controls=weather-preview]' >/dev/null
agent-browser press Enter >/dev/null
agent-browser wait '#weather-preview table' >/dev/null
agent-browser eval '(() => {
  const card=document.querySelector("#weather-preview");
  if(document.activeElement!==card)throw new Error("Keyboard entry did not reach forecast");
  const rows=[...card.querySelectorAll("tbody tr")].map(row=>[...row.querySelectorAll("td")].map(cell=>cell.textContent));
  if(rows[0].join()!=="27.3,26.1"||rows[2].join()!=="75,58"||rows[3].join()!=="0.40,0.10")throw new Error("Forecast values misaligned");
  if(card.querySelector("time").textContent!=="Wed 23:00")throw new Error("Forecast not in Kuala Lumpur time");
  if(!card.textContent.includes("last 15 min")||!card.textContent.includes("4.8 km/h"))throw new Error("Stats units missing");
  if(document.querySelector(".landing-solar"))throw new Error("Forecast activated clock scene");
  return "PASS forecast values, MYT timestamps, accumulation units and keyboard entry";
})()'
agent-browser press Escape >/dev/null
agent-browser eval 'if(document.querySelector("#weather-preview")||document.activeElement?.getAttribute("aria-controls")!=="weather-preview")throw new Error("Escape failed to dismiss and restore focus")' >/dev/null
agent-browser reload >/dev/null
agent-browser wait --fn 'window.weatherFixture?.pending.length === 1' >/dev/null
agent-browser eval 'weatherFixture.complete(503, {error:true})' >/dev/null
agent-browser wait --fn 'document.querySelector(".personal-clock a").textContent === "KUL WEATHER UNAVAILABLE"' >/dev/null
agent-browser eval 'window.dispatchEvent(new Event("online"))' >/dev/null
agent-browser wait --fn 'weatherFixture.pending.length === 1' >/dev/null
agent-browser eval 'weatherFixture.complete(200,{current:{temperature_2m:24.5,weather_code:55,rain:0.3}})' >/dev/null
agent-browser wait --fn 'document.querySelector(".personal-clock a").textContent === "KUL 25°C RAINY"' >/dev/null
agent-browser eval 'if(document.querySelector(".landing-solar"))throw new Error("Weather recovery activated background at idle");"PASS settled HTTP failure and online recovery without reload"'
