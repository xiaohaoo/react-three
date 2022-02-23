import * as THREE from "three";
import { useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "stats.js";
import Hammer from "hammerjs";

export default function App() {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const scene = new THREE.Scene();

    const group = new THREE.Group();
    const groupNext = new THREE.Group();
    const commonGroup = new THREE.Group();

    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight);
    camera.position.copy(new THREE.Vector3(0, 0, 10));

    const axesHelper = new THREE.AxesHelper(120);
    commonGroup.add(axesHelper);


    const cameraHelper = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight);
    const helper = new THREE.CameraHelper(cameraHelper);
    commonGroup.add(helper);

    const geometry = new THREE.SphereBufferGeometry(80, 60, 60);
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("https://xiaohaoo.oss-cn-beijing.aliyuncs.com/image/panorama.png")
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(new THREE.Vector3(0, 0, 0));
    group.add(mesh);

    const geometryNext = new THREE.SphereBufferGeometry(80, 60, 60);
    geometryNext.scale(-1, 1, 1);

    const materialNext = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("https://xiaohaoo.oss-cn-beijing.aliyuncs.com/image/panorama3.png")
    });

    const meshNext = new THREE.Mesh(geometryNext, materialNext);
    meshNext.position.copy(new THREE.Vector3(0, 0, 0));
    groupNext.add(meshNext);

    //指示文字
    const texture = new THREE.TextureLoader().load("https://xiaohaoo.oss-cn-beijing.aliyuncs.com/image/yonger.png");
    texture.needsUpdate = true;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    }));
    sprite.scale.set(10, 4, 1);
    sprite.position.set(0, 0, -35);
    sprite.center.set(0.5, 0);

    commonGroup.add(sprite);

    scene.add(group);
    scene.add(commonGroup);

    const indexRef = useRef(0);

    useEffect(() => {
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current!,
            antialias: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        const stats = new Stats();
        document.body.appendChild(stats.dom);

        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.autoRotate = true;
        orbitControls.rotateSpeed = -0.5 * orbitControls.rotateSpeed;
        orbitControls.target = mesh.position;
        orbitControls.minDistance = 2.5;
        orbitControls.maxDistance = 75;
        orbitControls.panSpeed = 2;

        const render = () => {
            orbitControls.update();
            helper.update();
            renderer.render(scene, camera);
            stats.update();
        };


        const hammer = new Hammer(document.body);
        hammer.on("tap", (event) => {
            const x = ( event.center.x / window.innerWidth ) * 2 - 1;
            const y = -( event.center.y / window.innerHeight ) * 2 + 1;
            const vector = new THREE.Vector3(x, y, sprite.position.z).unproject(camera);
            const raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
            raycaster.camera = camera;
            const intersects = raycaster.intersectObject(sprite);

            if (intersects.length > 0) {
                orbitControls.reset();
                if (indexRef.current === 1) {
                    scene.clear();
                    sprite.position.set(0, 0, -35);
                    scene.add(group);
                    scene.add(commonGroup);
                    indexRef.current = 0;
                } else {
                    scene.clear();
                    sprite.position.set(10, 20, -35);
                    scene.add(groupNext);
                    scene.add(commonGroup);
                    indexRef.current = 1;
                }
            }
        });


        renderer.setAnimationLoop(render);

    }, []);

    return <canvas ref={canvasRef} />;
}
