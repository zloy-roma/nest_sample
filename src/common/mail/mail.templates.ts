export interface MailTemplates {
    main: MainTemplate;
}

interface MainTemplate {
    site_name: string;
    site_url: string;
    greeting?: string;
    paragraphs?: string[];
    button?: {
        name: string;
        link: string;
        color?: string;
        disable_extra_link?: boolean;
        extra_link_text?: string;
    };
    footer?: {
        footer_text?: string;
        year?: {
            from: number;
            to: number;
        };
    };
}
