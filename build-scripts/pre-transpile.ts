// import fs
import fs from "fs";

(function(){
    fs.rmSync("./dist", { recursive: true });
    fs.mkdirSync("./dist");

    
    


})()