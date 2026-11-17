import { Component, Vector3 } from "../../libs/xviewer";

export const cameraCenter = new Vector3()

let __delta = new Vector3();

/**
 * Moves the camera forward forever. The original stopped in front of the door
 * and rushed through it on click; the wallpaper never stops.
 */
export class ForwardCamera extends Component {
    public speed = new Vector3(0, 0, -88)

    onLoad(props: any): void {
        cameraCenter.set(0, 0, 0);
    }

    update(dt: number): void {
        cameraCenter.add(__delta.copy(this.speed).multiplyScalar(dt));
        this.viewer.camera.position.copy(cameraCenter)
    }
}
