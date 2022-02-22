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

        window.ontouchstart = (event) => {
            const touch = event.changedTouches[0];
            start.x = touch.clientX;
            start.y = touch.clientY;
            last.x = touch.clientX;
            last.y = touch.clientY;
            onMouseDown = true;
        };

        window.onmousedown = (event) => {
            start.x = event.clientX;
            start.y = event.clientY;
            last.x = event.clientX;
            last.y = event.clientY;
            onMouseDown = true;
        };

        window.onwheel = (event) => {
            if (event.deltaY != 0) {
                console.log("onwheel", event.deltaY);
                camera.fov = camera.fov + event.deltaY * 0.01;
                camera.fov > 100 && ( camera.fov = 100 );
                camera.fov < 30 && ( camera.fov = 30 );
                camera.updateProjectionMatrix();
            }
        };


        window.onmousemove = (event) => {
            if (onMouseDown) {
                const x = ( event.clientX - last.x ) * -0.002;
                const y = ( event.clientY - last.y ) * -0.002;
                last.x = event.clientX;
                last.y = event.clientY;
                camera.rotateX(-y);
                camera.rotateY(-x);
            }

        };

        window.ontouchmove = (event) => {
            if (onMouseDown) {
                const touch = event.changedTouches[0];
                const x = ( touch.clientX - last.x ) * -0.002;
                const y = ( touch.clientY - last.y ) * -0.002;
                last.x = touch.clientX;
                last.y = touch.clientY;
                camera.rotateX(-y);
                camera.rotateY(-x);
            }

        };

        window.onmouseup = () => {
            onMouseDown = false;
        };


        window.ontouchend = () => {
            onMouseDown = false;
        };

    }, []);


    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    return <canvas ref={canvasRef} />;
}
