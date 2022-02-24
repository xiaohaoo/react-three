/*
 * Copyright (c) 2022 xiaohao
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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

    //屏幕渲染相机
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 5);
    camera.position.copy(new THREE.Vector3(0, 0, 30));

    //辅助坐标根据
    const axesHelper = new THREE.AxesHelper(120);
    commonGroup.add(axesHelper);

    //辅助相机工具
    const cameraHelper = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 5);
    const helper = new THREE.CameraHelper(cameraHelper);
    commonGroup.add(helper);

    //全景球
    const geometry = new THREE.SphereBufferGeometry(80, 60, 60);
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("https://xiaohaoo.oss-cn-beijing.aliyuncs.com/image/panorama.png")
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(new THREE.Vector3(0, 0, 0));
    group.add(mesh);


    const materialNext = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("https://xiaohaoo.oss-cn-beijing.aliyuncs.com/image/panorama3.png")
    });

    const meshNext = new THREE.Mesh(geometry, materialNext);
    meshNext.position.copy(new THREE.Vector3(0, 0, 0));
    groupNext.add(meshNext);

    //指示文字精灵
    const texture = new THREE.TextureLoader().load("https://xiaohaoo.oss-cn-beijing.aliyuncs.com/image/yonger.png");
    texture.needsUpdate = true;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    }));
    sprite.scale.set(18, 6, 1);
    sprite.position.set(0, 0, -72);
    sprite.center.set(0.5, 0);
    commonGroup.add(sprite);

    scene.add(group);
    scene.add(commonGroup);

    const indexRef = useRef(0);

    useEffect(() => {
        //渲染器
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current!,
            antialias: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        const stats = new Stats();
        document.body.appendChild(stats.dom);

        //相机控制工具
        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.autoRotate = true;
        orbitControls.rotateSpeed = -0.5 * orbitControls.rotateSpeed;
        orbitControls.target = mesh.position;
        orbitControls.minDistance = 2;
        orbitControls.maxDistance = 75;
        orbitControls.panSpeed = 2;

        const render = () => {
            orbitControls.update();
            helper.update();
            renderer.render(scene, camera);
            stats.update();
        };

        //手势检测
        const hammer = new Hammer(document.body);
        hammer.on("tap", (event) => {
            const x = ( event.center.x / window.innerWidth ) * 2 - 1;
            const y = -( event.center.y / window.innerHeight ) * 2 + 1;
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
            const intersects = raycaster.intersectObject(sprite);
            if (intersects.length > 0) {
                orbitControls.reset();
                if (indexRef.current === 1) {
                    scene.clear();
                    sprite.position.set(0, 0, -72);
                    scene.add(group);
                    scene.add(commonGroup);
                    indexRef.current = 0;
                } else {
                    scene.clear();
                    sprite.position.set(0, 28, -70);
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
