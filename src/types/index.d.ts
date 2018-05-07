export interface Context {
    config: Config
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

export interface RatingAgentInterface {
    rateRestaurant(restaurantId: number): Promise<any>
}

export interface DbWrapper {
    insertInto(table: string, values: any): Promise<any>
    getRestaurants(): Promise<any>
    getRestaurantDescriptionById(restaurantId: number): Promise<any>
    getRestaurantMenu(restaurantId: number): Promise<any>
    getUser(email: string, password: string): Promise<any>
    getRestaurantRatingById(restaurantId: number): Promise<any>
    getRestaurantReviewsById(restaurantId: number): Promise<any>
    updateRestaurantRating(restaurantId: number, rating: number): Promise<any>
}
