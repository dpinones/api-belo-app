import fs = require('fs');

export class ConfigSwagger {
    public static data() {
        const swaggerFile = process.cwd() + '/src/swagger/swagger.json';
        const swaggerData = fs.readFileSync(swaggerFile, 'utf8');
        return JSON.parse(swaggerData);
    }
}
