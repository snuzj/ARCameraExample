// Create a Three.js scene
const scene = new THREE.Scene();

// Create a Three.js camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Create a Three.js WebGLRenderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a video element for the webcam feed
const video = document.createElement('video');

// Wait for the webcam to initialize
navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
        // Attach the webcam stream to the video element
        video.srcObject = stream;
        video.play();

        // Wait for video metadata to ensure correct sizing
        video.onloadedmetadata = function () {
            // Initialize ARToolkitSource with the webcam feed
            const ArToolkitSource = new THREEx.ArToolkitSource({
                sourceType: 'webcam',
                source: video
            });

            // Initialize ARToolkitSource and adjust the renderer size after a delay
            ArToolkitSource.init(function () {
                setTimeout(function () {
                    ArToolkitSource.onResizeElement();
                    ArToolkitSource.copyElementSizeTo(renderer.domElement);
                }, 2000);
            });

            // Initialize ARToolkitContext with camera parameters
            const ArToolkitContext = new THREEx.ArToolkitContext({
                cameraParametersUrl: 'camera_para.dat',
                detectionMode: 'color_and_matrix'
            });

            // Initialize ARToolkitContext and set camera projection matrix
            ArToolkitContext.init(function () {
                camera.projectionMatrix.copy(ArToolkitContext.getProjectionMatrix());
            });

            // Create ARMarkerControls for pattern detection
            const ArMarkerControls = new THREEx.ArMarkerControls(
                ArToolkitContext,
                camera,
                {
                    type: 'pattern',
                    patternUrl: 'assets/pattern_bard.patt',
                    changeMatrixMode: 'cameraTransformMatrix'
                }
            );

            // Create a simple cube for visualization
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.y = geometry.parameters.height / 2;
            scene.add(cube);

            // Set the initial camera position
            camera.position.z = 5;

            // Animation loop
            function animate() {
                requestAnimationFrame(animate);

                // Update ARToolkitContext and set scene visibility
                ArToolkitContext.update(ArToolkitSource.domElement);
                scene.visible = camera.visible;

                // Render the scene
                renderer.render(scene, camera);
            }

            // Start the animation loop
            animate();
        };
    })
    .catch(function (error) {
        console.error('Error accessing webcam:', error);
    });
