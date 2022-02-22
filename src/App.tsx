import * as THREE from "three";
import { useEffect, useRef } from "react";
import Hammer from "hammerjs"; //引用hammerjs

export default function App() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 1, 40);
    camera.position.copy(new THREE.Vector3(0, 0, 0));

    const geometry = new THREE.SphereBufferGeometry(40, 60, 60);
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("https://xiaohaoo.oss-cn-beijing.aliyuncs.com/image/panorama.png")
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(new THREE.Vector3(0, 0, 0));

    scene.add(mesh);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current!,
            antialias: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        const render = (time: number) => {
            mesh.rotation.y = time / 8000;
            renderer.render(scene, camera);
        };
        renderer.setAnimationLoop(render);

        const hammer = new Hammer(canvasRef.current!);
        hammer.get("pinch").set({ enable: true });
        hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL });

        //缩放事件
        hammer.on("pinchmove", (event) => {
            if (event.scale < 1) {
                camera.fov = camera.fov + event.distance * 0.1;
            } else {
                camera.fov = camera.fov - event.distance * 0.1;
            }
            camera.fov > 115 && ( camera.fov = 115 );
            camera.fov < 30 && ( camera.fov = 30 );
            camera.updateProjectionMatrix();
        });

        //滑动事件
        hammer.on("panmove", (event) => {
            camera.rotateX(event.deltaY * 0.0003);
            camera.rotateY(event.deltaX * 0.0003);
        });


        window.onwheel = (event: WheelEvent) => {
            if (event.deltaY != 0) {
                camera.fov = camera.fov + event.deltaY * 0.01;
                camera.fov > 115 && ( camera.fov = 115 );
                camera.fov < 30 && ( camera.fov = 30 );
                camera.updateProjectionMatrix();
            }
        };

    }, []);


    return <canvas ref={canvasRef} />;
}
