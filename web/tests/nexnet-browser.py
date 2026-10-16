"""Exercise the real Worker with a disposable wallet and virtual authenticator.

Run against local Wrangler or the preview site, never production:
    python3 tests/nexnet-browser.py http://localhost:8790
Optional --restart-command restarts only a local runtime during passkey sign-in.
Requires the already-installed Playwright Python tooling and Chromium.
"""
import argparse
import subprocess
import shlex
import time
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument("url")
parser.add_argument("--restart-command")
args = parser.parse_args()
origin = args.url.rstrip("/")
host = urlparse(origin).hostname
if host not in ("localhost", "127.0.0.1", "next.undivisible.dev"):
    raise SystemExit("This test creates disposable identities; use localhost or next.undivisible.dev.")
if args.restart_command and host not in ("localhost", "127.0.0.1"):
    raise SystemExit("Restart tests are local only.")

SETUP = r"""async()=>{
 const originalFetch = window.fetch.bind(window);
 window.holdVerify = false;
 window.atVerify = false;
 const fetcher = async (...args)=>{
   if(window.holdVerify && new URL(args[0],location.origin).pathname==='/v1/auth/verify'){
     window.atVerify=true;
     await new Promise(resolve=>window.resumeVerify=resolve);
   }
   return originalFetch(...args);
 };
 const {createBridge}=await import('/nexnet/bridge.js');
 let next=1;const pending=new Map();window.framesSeen=[];
 window.bridge=createBridge({gatewayUrl:location.origin,fetcher},line=>{
  const frame=JSON.parse(line.replace(/^@@nexnet /,''));framesSeen.push(frame);
  if(pending.has(frame.id)){pending.get(frame.id)(frame);pending.delete(frame.id)}
 });
 window.request=(cmd,params={})=>new Promise((resolve,reject)=>{
  const id=next++;pending.set(id,resolve);
  bridge.feed(new TextEncoder().encode('@@nexnet '+JSON.stringify({id,cmd,...params})+'\n'));
  setTimeout(()=>{if(pending.delete(id))reject(new Error('request timed out'))},30000);
 });
}"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    cdp = page.context.new_cdp_session(page)
    cdp.send("WebAuthn.enable")
    cdp.send("WebAuthn.addVirtualAuthenticator", {"options": {
        "protocol": "ctap2", "transport": "internal", "hasResidentKey": True,
        "hasUserVerification": True, "isUserVerified": True,
        "automaticPresenceSimulation": True,
    }})
    page.goto(origin + "/simple/")
    page.evaluate(SETUP)

    def request(command, **params):
        return page.evaluate("([cmd,params])=>request(cmd,params)", [command, params])

    def success(command, **params):
        result = request(command, **params)
        assert result["ok"], (command, result.get("error"))
        return result["result"]

    success("hello", protocol=1)
    result = request("post", channel="public", body="must refuse signed-out posts")
    assert not result["ok"]
    identity = success("identity.create")["identity"]["id"]
    success("signin", method="wallet")
    assert not request("post", channel="updates", body="must refuse non-owner posts")["ok"]
    label = "staging verification " + str(time.time_ns())
    success("post", channel="public", body=label)
    print("Wallet identity, signed posts and owner-only Updates verified", flush=True)
    page.evaluate("()=>bridge.registerPasskey()")
    success("signout")

    if args.restart_command:
        page.evaluate("()=>{window.holdVerify=true;window.signinResult=request('signin',{method:'passkey'})}")
        page.wait_for_function("window.atVerify", timeout=10000)
        subprocess.run(shlex.split(args.restart_command), check=True)
        for _ in range(30):
            try:
                if page.request.get(origin + "/v1/info", timeout=1000).ok:
                    break
            except Exception:
                pass
            time.sleep(0.2)
        page.evaluate("window.holdVerify=false;window.resumeVerify()")
        result = page.evaluate("window.signinResult")
        assert result["ok"], result.get("error")
        print("Pending passkey challenge survived a local Worker restart", flush=True)
    else:
        success("signin", method="passkey")
    success("post", channel="public", body=label + " after passkey")
    print("Virtual WebAuthn registration, passkey sign-in and posting verified", flush=True)

    stream = page.evaluate(r"""()=>new Promise((resolve,reject)=>{
      const ws = new WebSocket(location.origin.replace(/^http/,'ws')+'/v1/stream');
      window.testSocket=ws;
      ws.onopen=()=>ws.send('{}');
      ws.onmessage=e=>{const event=JSON.parse(e.data);if(event.event==='ready')resolve(true)};
      ws.onerror=()=>reject(new Error('WebSocket failed'));
      setTimeout(()=>reject(new Error('Stream did not become ready')),10000);
    })""")
    assert stream
    page.evaluate("()=>{testSocket.onmessage=e=>window.streamMessage=JSON.parse(e.data)}")
    success("post", channel="public", body=label + " stream")
    page.wait_for_function("window.streamMessage?.event==='message'", timeout=5000)
    page.evaluate("testSocket.close()")
    print("Live WebSocket delivery verified", flush=True)

    page.reload()
    page.evaluate(SETUP)
    state = success("state")
    assert state["identity"]["id"] == identity
    success("signin", method="passkey")
    history = success("history", channel="public", limit=200)
    assert any(message["body"] == label for message in history["messages"])
    print("Browser reload preserves identity, passkey and stored entries", flush=True)
    wrong_origin = page.request.post(origin + "/v1/identity", data="{}", headers={"Origin": "https://evil.example.test", "Content-Type": "application/json"})
    assert wrong_origin.status == 403
    oversized = page.request.post(origin + "/v1/identity", data="x" * 65537)
    assert oversized.status == 413
    print("Cross-origin and oversized API requests refused", flush=True)
    browser.close()
