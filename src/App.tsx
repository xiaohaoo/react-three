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

import React, { useEffect, useRef, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "stats.js";
import Hammer from "hammerjs";
import * as THREE from "three";

export default function App() {

    const viewRef = useRef<HTMLDivElement>(null);

    const [process, setProcess] = useState(0);

    console.log("开始加载...");

    const currentIndex = useRef(0);

    useEffect(() => {
        console.log("开始渲染...");
        //场景
        const scene = new THREE.Scene();

        //场景组
        const group = new THREE.Group();
        const groupNext = new THREE.Group();
        const commonGroup = new THREE.Group();


        //加载进度显示
        const loadingManager = new THREE.LoadingManager(() => {
            cameraAnimation();
        }, (url: string, loaded: number, total: number) => {
            setProcess(Math.floor(loaded / total * 100));
        });

        //屏幕渲染相机
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 50);

        const cameraEndPosition = new THREE.Vector3(0, 0, 30);
        const cameraStartPosition = new THREE.Vector3(0, 0, 1000);
        camera.position.copy(cameraStartPosition);


        //辅助坐标根据
        const axesHelper = new THREE.AxesHelper(120);
        commonGroup.add(axesHelper);

        //相机辅助工具
        const cameraHelper = new THREE.CameraHelper(new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 50));
        commonGroup.add(cameraHelper);

        //全景球
        const geometry = new THREE.SphereBufferGeometry(80, 60, 60);
        geometry.scale(-1, 1, 1);

        const material = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader(loadingManager).load("https://xiaohaoo.oss-cn-beijing.aliyuncs.com/image/panorama.png")
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(new THREE.Vector3(0, 0, 0));
        group.add(mesh);


        const materialNext = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader(loadingManager).load("https://xiaohaoo.oss-cn-beijing.aliyuncs.com/image/panorama3.png")
        });

        const meshNext = new THREE.Mesh(geometry, materialNext);
        meshNext.position.copy(new THREE.Vector3(0, 0, 0));
        groupNext.add(meshNext);

        //指示文字精灵
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: new THREE.TextureLoader(loadingManager).load("https://xiaohaoo.oss-cn-beijing.aliyuncs.com/image/yonger.png"),
            transparent: true
        }));
        sprite.scale.set(18, 6, 1);
        sprite.position.set(0, 0, -72);
        sprite.center.set(0.5, 0);
        commonGroup.add(sprite);

        scene.add(group);
        scene.add(commonGroup);

        //性能检测工具
        const stats = new Stats();


        //渲染器
        const renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        viewRef.current?.appendChild(renderer.domElement);
        viewRef.current?.appendChild(stats.dom);

        const render = (event: number) => {
            orbitControls.update();
            cameraHelper.update();
            renderer.render(scene, camera);
            stats.update();
        };
        renderer.setAnimationLoop(render);

        //相机控制工具
        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.rotateSpeed = -0.5 * orbitControls.rotateSpeed;
        orbitControls.target = mesh.position;
        orbitControls.minDistance = 2;
        orbitControls.panSpeed = 2;
        orbitControls.enablePan = false;
        orbitControls.autoRotate = true;

        const cameraAnimation = () => {
            orbitControls.maxDistance = Number.POSITIVE_INFINITY;
            camera.position.copy(cameraStartPosition);
            const terval = setInterval(() => {
                camera.position.z -= 1000 / ( 800 / 50 );
                mesh.rotation.z += 3 * Math.PI / ( 800 / 50 );
                meshNext.rotation.copy(mesh.rotation);
            }, 50);
            setTimeout(() => {
                clearInterval(terval);
                mesh.rotation.set(0, 0, 0);
                meshNext.rotation.copy(mesh.rotation);
                camera.position.copy(cameraEndPosition);
                orbitControls.maxDistance = 75;
            }, 800);
        };

        //手势检测
        const hammer = new Hammer(viewRef?.current || document.body);
        hammer.on("tap", (event) => {
            const x = ( event.center.x / window.innerWidth ) * 2 - 1;
            const y = -( event.center.y / window.innerHeight ) * 2 + 1;
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
            const intersects = raycaster.intersectObject(sprite);

            if (intersects.length > 0) {
                orbitControls.reset();
                if (currentIndex.current == 1) {
                    scene.clear();
                    sprite.position.set(0, 0, -72);
                    scene.add(group);
                    scene.add(commonGroup);
                    currentIndex.current = 0;
                } else {
                    scene.clear();
                    sprite.position.set(0, 28, -70);
                    scene.add(groupNext);
                    scene.add(commonGroup);
                    currentIndex.current = 1;
                }
                cameraAnimation();
            }
        });
    }, []);
    return <div>
        <div style={{ display: process >= 100 ? "" : "none" }} ref={viewRef} />
        <div style={{ display: process < 100 ? "" : "none" }} className={"loading"}>{process}%</div>
    </div>;
}
