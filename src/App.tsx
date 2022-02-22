import * as THREE from "three";
import { useEffect, useRef } from "react";

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
        const start: { [key: string]: number } = {
            x: 0,
            y: 0,
            z: 0
        };
        const last: { [key: string]: number } = {
            x: 0,
            y: 0,
            z: 0
        };

        let onMouseDown = false;

        const onStart = (event: TouchEvent | MouseEvent) => {
            const touch = event instanceof TouchEvent ? event.changedTouches[0] : event;
            start.x = touch.clientX;
            start.y = touch.clientY;
            last.x = touch.clientX;
            last.y = touch.clientY;
            onMouseDown = true;
        };

        const onEnd = (event: TouchEvent | MouseEvent) => {
            onMouseDown = false;
        };

        const onMove = (event: TouchEvent | MouseEvent) => {
            if (onMouseDown) {
                const touch = event instanceof TouchEvent ? event.changedTouches[0] : event;
                const x = ( touch.clientX - last.x ) * -0.002;
                const y = ( touch.clientY - last.y ) * -0.002;
                last.x = touch.clientX;
                last.y = touch.clientY;
                camera.rotateX(-y);
                camera.rotateY(-x);
            }
        };
        window.ontouchstart = onStart;
        window.onmousedown = onStart;

        window.onmousemove = onMove;
        window.ontouchmove = onMove;

        window.onmouseup = onEnd;
        window.ontouchend = onEnd;

        window.onwheel = (event) => {
            if (event.deltaY != 0) {
                console.log("onwheel", event.deltaY);
                camera.fov = camera.fov + event.deltaY * 0.01;
                camera.fov > 100 && ( camera.fov = 100 );
                camera.fov < 30 && ( camera.fov = 30 );
                camera.updateProjectionMatrix();
            }
        };

    }, []);


    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    return <canvas ref={canvasRef} />;
}
