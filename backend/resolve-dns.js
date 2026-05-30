async function resolveAtlas() {
    try {
        console.log("Querying Google Public DNS HTTPS API...");
        
        // 1. Resolve SRV record
        const srvRes = await fetch("https://dns.google/resolve?name=_mongodb._tcp.cluster0.1xxgn4r.mongodb.net&type=SRV");
        const srvData = await srvRes.json();
        
        console.log("\n--- SRV records ---");
        console.log(JSON.stringify(srvData, null, 2));

        // 2. Query TXT record
        const txtRes = await fetch("https://dns.google/resolve?name=cluster0.1xxgn4r.mongodb.net&type=TXT");
        const txtData = await txtRes.json();
        
        console.log("\n--- TXT records ---");
        console.log(JSON.stringify(txtData, null, 2));
        
        if (srvData.Answer) {
            const hosts = srvData.Answer.map(ans => {
                // Answer format: "10 0 27017 cluster0-shard-00-00.1xxgn4r.mongodb.net."
                const parts = ans.data.split(" ");
                const port = parts[2];
                let host = parts[3];
                if (host.endsWith(".")) host = host.slice(0, -1);
                return `${host}:${port}`;
            }).join(",");
            
            let replicaSet = "";
            let authSource = "admin";
            if (txtData.Answer) {
                const txtVal = txtData.Answer[0].data;
                // txtVal looks like: "authSource=admin&replicaSet=atlas-xxxxx-shard-0"
                const params = new URLSearchParams(txtVal.replace(/"/g, ''));
                replicaSet = params.get("replicaSet");
                authSource = params.get("authSource") || "admin";
            }
            
            console.log("\n=== CONSTRUCTED STANDARD CONNECTION STRING ===");
            const standardString = `mongodb://batmanx637_db_user:LMlfQoiS5Tz1n0uz@${hosts}/salon_booking?ssl=true&replicaSet=${replicaSet}&authSource=${authSource}`;
            console.log(standardString);
        } else {
            console.log("No SRV answers returned.");
        }
    } catch (err) {
        console.error("Resolution failed:", err.message);
    }
}

resolveAtlas();
