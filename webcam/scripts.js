window.onload = function () {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Tạo một phần tử video để hiển thị feed từ camera
    const video = document.createElement('video');
    document.body.appendChild(video);

    const getUserMedia = navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    if (getUserMedia) {
        getUserMedia.call(navigator.mediaDevices, { video: true })
            .then(function (stream) {
                video.srcObject = stream;
                video.play();

                video.onloadedmetadata = function () {
                    const ArToolkitSource = new THREEx.ArToolkitSource({
                        sourceType: 'webcam',
                        source: video
                    });

                    ArToolkitSource.init(function onReady() {
                        ArToolkitSource.onResizeElement();
                        ArToolkitSource.copyElementSizeTo(renderer.domElement);
                    });

                    const ArToolkitContext = new THREEx.ArToolkitContext({
                        cameraParametersUrl: 'camera_para.dat',
                        detectionMode: 'color_and_matrix'
                    });

                    ArToolkitContext.init(function onCompleted() {
                        camera.projectionMatrix.copy(ArToolkitContext.getProjectionMatrix());
                    });

                    const ArMarkerControls = new THREEx.ArMarkerControls(
                        ArToolkitContext,
                        camera,
                        {
                            type: 'pattern',
                            patternUrl: 'assets/pattern_bard.patt',
                            changeMatrixMode: 'cameraTransformMatrix'
                        }
                    );

                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

                    const cube = new THREE.Mesh(geometry, material);
                    cube.position.y = geometry.parameters.height / 2;
                    scene.add(cube);

                    camera.position.z = 5;

                    function animate() {
                        requestAnimationFrame(animate);
                        ArToolkitContext.update(ArToolkitSource.domElement);
                        scene.visible = camera.visible;
                        renderer.render(scene, camera);
                    }

                    animate();
                };
            })
            .catch(function (error) {
                console.error('Lỗi khi truy cập webcam:', error);
            });
    } else {
        console.error('Trình duyệt không hỗ trợ getUserMedia.');
    }
};
