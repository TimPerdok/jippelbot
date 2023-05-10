

async function pretranspile() {
    const fs = await import("fs");

    fs.rmSync("./dist", { recursive: true });
    fs.mkdirSync("./dist");
}
    
pretranspile()