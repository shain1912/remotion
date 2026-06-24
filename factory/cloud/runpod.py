#!/usr/bin/env python3
# RunPod GraphQL helper. Usage:
#   python runpod.py setssh <pubkey_file>
#   python runpod.py deploy <name> [gpu] [diskGb]
#   python runpod.py status <podId>
#   python runpod.py terminate <podId>
#   python runpod.py list
import sys, json, os, urllib.request, pathlib

def api_key():
    # 1) env var, 2) .env at repo root (two levels up from factory/cloud/), 3) cwd/.env
    if os.environ.get("RUNPOD_API_KEY"):
        return os.environ["RUNPOD_API_KEY"].strip()
    here = pathlib.Path(__file__).resolve()
    for env_path in (here.parents[2] / ".env", pathlib.Path(".env")):
        if env_path.exists():
            for line in env_path.read_text(encoding="utf-8", errors="ignore").splitlines():
                if line.strip().upper().startswith("RUNPOD_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("no RUNPOD_API_KEY (set env var or add to .env at repo root)")

def gql(query, variables=None):
    body = json.dumps({"query": query, "variables": variables or {}}).encode()
    req = urllib.request.Request(
        f"https://api.runpod.io/graphql?api_key={api_key()}",
        data=body, headers={"Content-Type": "application/json", "User-Agent": "curl/8.4.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        d = json.loads(r.read())
    if d.get("errors"):
        print("GQL ERROR:", json.dumps(d["errors"])[:400]);
    return d.get("data")

cmd = sys.argv[1] if len(sys.argv) > 1 else ""

if cmd == "setssh":
    pub = pathlib.Path(sys.argv[2]).read_text().strip()
    d = gql("mutation($k:String!){updateUserSettings(input:{pubKey:$k}){id}}", {"k": pub})
    print("setssh:", d)

elif cmd == "deploy":
    name = sys.argv[2]
    disk = int(sys.argv[3]) if len(sys.argv) > 3 else 50
    img = "runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04"
    q = """mutation($in:PodFindAndDeployOnDemandInput!){podFindAndDeployOnDemand(input:$in){id imageName machineId costPerHr}}"""
    # try several GPUs across community then secure until one has supply
    cands = [("COMMUNITY","NVIDIA GeForce RTX 4090"),("COMMUNITY","NVIDIA GeForce RTX 3090"),
             ("COMMUNITY","NVIDIA A40"),("SECURE","NVIDIA A40"),("COMMUNITY","NVIDIA RTX A5000"),
             ("SECURE","NVIDIA GeForce RTX 4090"),("COMMUNITY","NVIDIA GeForce RTX 3090 Ti")]
    for cloud, gpu in cands:
        var = {"in": {
            "cloudType": cloud, "gpuTypeId": gpu, "name": name, "imageName": img,
            "gpuCount": 1, "minVcpuCount": 4, "minMemoryInGb": 20,
            "volumeInGb": disk, "containerDiskInGb": disk,
            "volumeMountPath": "/workspace", "ports": "22/tcp,8000/http",
            "startSsh": True, "dockerArgs": "",
        }}
        d = gql(q, var)
        if d and d.get("podFindAndDeployOnDemand"):
            print(f"deploy OK [{cloud} {gpu}]:", json.dumps(d)); break
        else:
            print(f"  no supply: {cloud} {gpu}")

elif cmd == "status":
    pid = sys.argv[2]
    q = """query($id:String!){pod(input:{podId:$id}){id desiredStatus lastStatusChange runtime{uptimeInSeconds ports{ip isIpPublic privatePort publicPort type}}}}"""
    print(json.dumps(gql(q, {"id": pid}), indent=1))

elif cmd == "terminate":
    pid = sys.argv[2]
    d = gql("mutation($id:String!){podTerminate(input:{podId:$id})}", {"id": pid})
    print("terminate:", d)

elif cmd == "list":
    d = gql("query{myself{pods{id name desiredStatus costPerHr runtime{ports{ip publicPort privatePort type isIpPublic}}}}}")
    print(json.dumps(d, indent=1))

else:
    print(__doc__)
