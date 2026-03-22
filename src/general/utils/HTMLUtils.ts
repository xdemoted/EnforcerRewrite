class HTMLUtils {
    static fillTemplate(template: string, values: { [key: string]: string }): string {
        let filledTemplate = template;
        for (const key in values) {
            const placeholder = `{{${key}}}`;
            filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), values[key]);
        }
        return filledTemplate;
    }
    static getProperties(innerText: string): { [key: string]: string } {
        const properties: { [key: string]: string } = {};
        const regex = /(\w+)="([^"]*)"/g;
        let match;
        while ((match = regex.exec(innerText)) !== null) {
            properties[match[1]] = match[2];
        }
        return properties;
    }
}

export default HTMLUtils;