
import { Component, Mesh, Object3D, TWEEN, Vector3 } from "../../libs/xviewer";
import { cameraCenter } from "./ForwardCamera";
import { toonMaterials } from "./Materials";

/**
 * The road: a set of segments that recycle forever as the camera moves forward.
 * A segment that falls behind the camera is pushed back by one full length and
 * drops in from below with a Back.Out tween, which is the only "motion beat" the
 * loop has. The original door stop is removed.
 */
export class Road extends Component {
    private zLength = 212.4027;
    private offset = new Vector3(0, 34, 200)//一开始是道路的起始偏移，后面变成门的偏移
    private extendNum = 1;//扩展出的长度
    private RoadUnitLength = 0;
    private obj!: Object3D
    private originPosList: Vector3[] = [];

    onLoad(): void {
        const v = this.viewer.user.resources.SM_Road
        this.viewer.scene.add(v)
        v.traverse((mesh: any) => {
            mesh.receiveShadow = true
            if (mesh instanceof Mesh) {
                mesh.material = toonMaterials.getToonMaterial_Road(mesh.material, this.viewer.renderer)
                mesh.receiveShadow = true
            }
        })

        for (let i of v.children) {
            i.scale.multiplyScalar(0.1)
            i.position.multiplyScalar(0.1)
            i.position.sub(this.offset)
        }
        let n = v.children.length
        this.RoadUnitLength = n;
        for (let i = 0; i < this.extendNum; i++) {
            for (let j = 0; j < n; j++) {
                let clone = this.cloneObject3D(v.children[j]);
                clone.position.add(new Vector3(0, 0, -this.zLength * (1 + i)))
                v.add(clone)
            }
        }
        this.zLength *= 1 + this.extendNum
        this.obj = v
        for (let i = 0; i < this.obj.children.length; i++) {
            this.originPosList.push(this.obj.children[i].position.clone())
        }
    }

    update(dt: number): void {
        if (!this.obj) return;
        for (let i = 0; i < this.obj.children.length; i++) {
            if (this.obj.children[i].position.z > cameraCenter.z) {
                this.obj.children[i].position.sub(new Vector3(0, 0, this.zLength))
                this.originPosList[i].sub(new Vector3(0, 0, this.zLength))
                let originalPos = this.originPosList[i].clone()
                this.obj.children[i].position.add(new Vector3(0, -70, 0))
                TWEEN.TweenManager.KillTweensOf(this.obj.children[i]);
                TWEEN.TweenManager.Tween(this.obj.children[i])
                    .to({ position: originalPos }, 2)
                    .easing(TWEEN.Easing.Back.Out)
                    .start();
            }
        }
    }

    private cloneObject3D(object) {
        const clone = object.clone();
        return clone;
    }
}
