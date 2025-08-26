export interface Actor {
    actor_id: string;
    namespace: string;
    name: string;
    class_name: string;
    state: "ALIVE" | "DEAD" | "PENDING_CREATION";
}
