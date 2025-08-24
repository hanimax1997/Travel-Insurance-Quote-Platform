export class Patterns {
    public static mobile: string = "[1-9][0-9]{8}"; 
    public static indicatifMobile: string = "0[5-7]{1}[0-9]{8}"; 
    public static fixe: string = "^[1-9][0-9]{8}$"; 
    public static email: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$";
    public static number: string = "^[0-9]*$"; 
    public static alphanumerique: string = "^[a-zA-Z0-9_]*$";
    public static string: string = "^[a-zA-Z À-ÿ \-\']+"; 
    public static nom: string = "^[a-zA-Z-' À-ÿ]+"; 
    public static date: string = "^[a-zA-Z0-9-' À-ÿ]+"; 
} 