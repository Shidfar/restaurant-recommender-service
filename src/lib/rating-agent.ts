

import { Context, DbWrapper, RatingAgentInterface } from 'index'

export const name = 'rating-agent'

export function Client(context: Context, db: DbWrapper): RatingAgentInterface {
    async function rateRestaurant(restaurantId: number): Promise<any> {
        try {
            const rating = await db.getRestaurantRatingById(restaurantId)
            await db.updateRestaurantRating(restaurantId, rating[0].rating)
        } catch (e) {
            console.log('Could not update restaurant ratings', e)
        }
    }
    return { rateRestaurant }
}
