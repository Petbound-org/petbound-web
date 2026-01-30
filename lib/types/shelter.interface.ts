export interface Shelter {
    id: number,
    /** Links shelter to auth user when shelter signs up via the platform */
    user_id: string | null,
    name: string | null,
    address: string | null,
    city: string | null,
    state: string | null,
    phone_number: string | null,
    email: string | null,
    created_at: string | null,
    updated_at: string | null,
    latitude: number | null,
    longitude: number | null,
    coordinate: unknown
}