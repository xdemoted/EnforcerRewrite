class HTMLUtils {
    static fillTemplate(template: string, values: { [key: string]: string }): string {
        let filledTemplate = template;
        for (const key in values) {
            const placeholder = `{{${key}}}`;
            filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), values[key]);
        }
        return filledTemplate;
    }
}

export default HTMLUtils;