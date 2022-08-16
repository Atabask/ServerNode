import http from "http"
import path from "path"
import fs from "fs"
import commonjsVariables from 'commonjs-variables-for-esmodules';


const { __dirname } = commonjsVariables(import.meta);

(async () =>  {

    const isFile = (path) => fs.lstatSync(path).isFile();

    http.createServer((req, res) => {
        const fullPath = path.join(process.cwd(), req.url);
        console.log(fullPath);

        if(!fs.existsSync(fullPath)) return res.end('Not Found');

        if(isFile(fullPath)) {
            return fs.createReadStream(fullPath).pipe(res)
        };

        let linksList = '';

        const urlParams = req.url.match(/[\d\w\.]+/gi);

        if(urlParams) {
            urlParams.pop();
            const prevUrl = urlParams.join('/');
            linksList = urlParams.length ? `<li><a href="/${prevUrl}">...back</a></li>` : `<li><a href="/">...</a></li>` 
        };

        fs.readdirSync(fullPath).forEach(fileName => {
            const filePath = path.join(req.url, fileName);
            linksList += `<li><a href="${filePath}">${fileName}</a></li>`;
        });
        const HTML = fs.readFileSync(path.join(__dirname, 'index.html' ), 'utf-8').replace('##links', linksList);
        res.writeHead(200, {
            'Content-Type' : 'text/html',
        });
        return res.end(HTML);
    }).listen(3000);
})()