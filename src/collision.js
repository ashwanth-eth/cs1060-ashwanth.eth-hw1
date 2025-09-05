export class CollisionDetector {
    constructor() {
        // Optional: Add collision debugging visualization
        this.showCollisions = false;
    }
    
    // Circle vs AABB collision detection
    circleAABB(circle, aabb) {
        // Handle pipe with multiple collision boxes
        if (aabb.getCollisionBoxes) {
            const boxes = aabb.getCollisionBoxes();
            return boxes.some(box => this.circleAABBSimple(circle, box));
        }
        
        return this.circleAABBSimple(circle, aabb);
    }
    
    circleAABBSimple(circle, box) {
        // Find the closest point on the AABB to the circle center
        const closestX = Math.max(box.x, Math.min(circle.x, box.x + box.width));
        const closestY = Math.max(box.y, Math.min(circle.y, box.y + box.height));
        
        // Calculate distance from circle center to closest point
        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        
        // Check if distance is less than circle radius
        return distanceSquared < (circle.radius * circle.radius);
    }
    
    // Point vs AABB collision
    pointAABB(point, aabb) {
        return point.x >= aabb.x &&
               point.x <= aabb.x + aabb.width &&
               point.y >= aabb.y &&
               point.y <= aabb.y + aabb.height;
    }
    
    // Circle vs Circle collision
    circleCircle(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (circle1.radius + circle2.radius);
    }
    
    // AABB vs AABB collision
    aabbAABB(aabb1, aabb2) {
        return aabb1.x < aabb2.x + aabb2.width &&
               aabb1.x + aabb1.width > aabb2.x &&
               aabb1.y < aabb2.y + aabb2.height &&
               aabb1.y + aabb1.height > aabb2.y;
    }
    
    // Get collision normal for response
    getCollisionNormal(circle, aabb) {
        const closestX = Math.max(aabb.x, Math.min(circle.x, aabb.x + aabb.width));
        const closestY = Math.max(aabb.y, Math.min(circle.y, aabb.y + aabb.height));
        
        const dx = circle.x - closestX;
        const dy = circle.y - closestY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) {
            return { x: 0, y: -1 }; // Default to up
        }
        
        return {
            x: dx / length,
            y: dy / length
        };
    }
}