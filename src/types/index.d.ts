export interface Context {
    config: Config
    userBase: any[]
}

export interface Config {
    cors: Cors
    app: Application
}

interface Application {
    host: string
    port: number
}

interface Cors {
    allowedOrigins: string[]
}