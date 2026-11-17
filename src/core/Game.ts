import {
    LinearEncoding,
    NoToneMapping,
    ToneMappingMode,
    ToneMappingPlugin,
    Viewer,
    AssetManager,
    DeviceInput,
    Fog,
    FXAAPlugin,
    BloomPlugin,
    $r,
} from "../libs/xviewer";

import { User } from "./User";
import { gameManager } from "./GameManager";
import { StateHandler } from "./states/StateHandler";
import { StateMachine } from "./states/StateMachine";
import { AmbientLightComponent } from "./components/AmbientLightComponent";
import { Road } from "./components/Road";
import { ForwardCamera } from "./components/ForwardCamera";
import { DirectionalLightComponent } from "./components/DirectionalLightComponent";
import { PolarLight } from "./components/PolarLight";
import { Cloud } from "./components/Cloud";
import { HashFog } from "./components/HashFog";
import { Column } from "./components/Column";
import { BigCloud } from "./components/BigCloud";
import { gradientBackgroundPlugin } from "./components/gradientBackground";

let onResizeOrigin = DeviceInput.prototype["_onResize"];
function resizeWindow() {
    var width = document.documentElement.clientWidth;
    var height = document.documentElement.clientHeight;
    if (width > height) {
        DeviceInput.prototype["_onResize"] = onResizeOrigin
    }
    else {
        DeviceInput.prototype["_onResize"] = function () {
            this.viewer.resize(height, width);
            this.viewer.emit(DeviceInput.RESIZE, height, width);
        }
    }
}
resizeWindow()

var evt = "resize";//"onorientationchange" in window ? "orientationchange" : "resize";
window.addEventListener(evt, resizeWindow, false);


export class Game {
    public viewer!: Viewer;
    public SM: StateMachine = new StateMachine(this);

    constructor(canvas: HTMLCanvasElement) {
        this.viewer = new Viewer({
            canvas,
            camera: { fov: 45, near: 50, far: 100000, rotation: $r(5.5 * Math.PI / 180, 0, 0) },
            user: new User(),
            linear: false, toneMapping: NoToneMapping, outputEncoding: LinearEncoding
        });
        this.SM.registState(StatePreload);
        this.SM.registState(StateGame);
        this.SM.setState("StatePreload");
        this.SM.setState("StateGame");
    }

    public destroy() {
        this.SM.reset();
        this.viewer.destroy();
    }
}

class StatePreload extends StateHandler<Game> {
    public name: string = "StatePreload";

    public onEnter() {
        const resources = this.target.viewer.user.resources;
        return Promise.all([
            gameManager.task(AssetManager.Load({ url: "Genshin/Login/DOOR.glb" }).then((v) => resources.DOOR = v), { name: "DOOR" }),
            gameManager.task(AssetManager.Load({ url: "Genshin/Login/SM_BigCloud.glb" }).then((v) => resources.SM_BigCloud = v), { name: "SM_BigCloud" }),
            gameManager.task(AssetManager.Load({ url: "Genshin/Login/SM_Light.glb" }).then((v) => resources.SM_Light = v), { name: "SM_Light" }),
            gameManager.task(AssetManager.Load({ url: "Genshin/Login/SM_Qiao01.glb" }).then((v) => resources.SM_Qiao01 = v), { name: "SM_Qiao01" }),
            gameManager.task(AssetManager.Load({ url: "Genshin/Login/SM_Qiao02.glb" }).then((v) => resources.SM_Qiao02 = v), { name: "SM_Qiao02" }),
            gameManager.task(AssetManager.Load({ url: "Genshin/Login/SM_Qiao03.glb" }).then((v) => resources.SM_Qiao03 = v), { name: "SM_Qiao03" }),
            gameManager.task(AssetManager.Load({ url: "Genshin/Login/SM_Qiao04.glb" }).then((v) => resources.SM_Qiao04 = v), { name: "SM_Qiao04" }),
            gameManager.task(AssetManager.Load({ url: "Genshin/Login/SM_Road.glb" }).then((v) => resources.SM_Road = v), { name: "SM_Road" }),
            gameManager.task(AssetManager.Load({ url: "Genshin/Login/SM_ZhuZi01.glb" }).then((v) => resources.SM_ZhuZi01 = v), { name: "SM_ZhuZi01" }),
            gameManager.task(AssetManager.Load({ url: "Genshin/Login/SM_ZhuZi02.glb" }).then((v) => resources.SM_ZhuZi02 = v), { name: "SM_ZhuZi02" }),
            gameManager.task(AssetManager.Load({ url: "Genshin/Login/SM_ZhuZi03.glb" }).then((v) => resources.SM_ZhuZi03 = v), { name: "SM_ZhuZi03" }),
            gameManager.task(AssetManager.Load({ url: "Genshin/Login/SM_ZhuZi04.glb" }).then((v) => resources.SM_ZhuZi04 = v), { name: "SM_ZhuZi04" }),
            gameManager.task(AssetManager.Load({ url: "Genshin/Login/WHITE_PLANE.glb" }).then((v) => resources.WHITE_PLANE = v), { name: "WHITE_PLANE" }),
        ]);
    }
}

/**
 * Loop-only scene: builds the road, the clouds, the lights and the forward
 * camera, then lets them run forever. The original game stopped the camera at a
 * door, played a bloom transition and redirected to a video; that whole path is
 * gone, so nothing interrupts the loop.
 */
class StateGame extends StateHandler<Game> {
    public name: string = "StateGame";

    public onEnter(...args: any[]): void | Promise<any> {
        this._initScene();
    }

    private _initScene() {
        const viewer = this.target.viewer;
        viewer.scene.fog = new Fog(0x389af2, 5000, 10000);

        viewer.addNode(AmbientLightComponent);
        viewer.addNode(DirectionalLightComponent);
        viewer.addNode(PolarLight);
        viewer.addNode(Cloud);
        viewer.addNode(HashFog);
        viewer.addNode(Column);
        viewer.addNode(BigCloud);

        viewer.addNode(ForwardCamera)
        viewer.addNode(Road);

        viewer.addPlugin(gradientBackgroundPlugin);
        viewer.addPlugin(FXAAPlugin)
        viewer.addPlugin(BloomPlugin, { mipmapBlur: true, luminanceThreshold: 2, intensity: 0.6 });

        viewer.addPlugin(ToneMappingPlugin, { mode: ToneMappingMode.ACES_FILMIC });
    }
}
