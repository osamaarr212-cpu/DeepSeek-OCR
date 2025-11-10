// Three.js 3D Coffee Cup Animation
let scene, camera, renderer, coffeeCup, steam;
let mouseX = 0, mouseY = 0;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    const container = document.getElementById('canvas-container');
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0xFFD700, 1, 100);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x0B6623, 0.8, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);
    
    // Create coffee cup
    createCoffeeCup();
    
    // Create floating coffee beans
    createCoffeeBeans();
    
    // Create steam particles
    createSteam();
    
    // Event listeners
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
    
    // Start animation
    animate();
}

function createCoffeeCup() {
    // Cup body (cylinder)
    const cupGeometry = new THREE.CylinderGeometry(0.8, 0.6, 1.5, 32);
    const cupMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 100,
        specular: 0x444444
    });
    const cup = new THREE.Mesh(cupGeometry, cupMaterial);
    
    // Coffee liquid
    const coffeeGeometry = new THREE.CylinderGeometry(0.75, 0.75, 0.1, 32);
    const coffeeMaterial = new THREE.MeshPhongMaterial({
        color: 0x3d2817,
        shininess: 80
    });
    const coffee = new THREE.Mesh(coffeeGeometry, coffeeMaterial);
    coffee.position.y = 0.7;
    
    // Handle
    const handleCurve = new THREE.EllipseCurve(
        0, 0,
        0.4, 0.5,
        0, Math.PI,
        false,
        0
    );
    const handlePoints = handleCurve.getPoints(50);
    const handleGeometry = new THREE.BufferGeometry().setFromPoints(handlePoints);
    const handleMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff,
        linewidth: 5
    });
    const handle = new THREE.Line(handleGeometry, handleMaterial);
    handle.position.set(0.8, 0, 0);
    handle.rotation.y = Math.PI / 2;
    
    // Combine cup parts
    coffeeCup = new THREE.Group();
    coffeeCup.add(cup);
    coffeeCup.add(coffee);
    coffeeCup.add(handle);
    
    scene.add(coffeeCup);
}

function createCoffeeBeans() {
    const beanGroup = new THREE.Group();
    
    for (let i = 0; i < 20; i++) {
        const beanGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        beanGeometry.scale(1.2, 0.8, 0.6);
        
        const beanMaterial = new THREE.MeshPhongMaterial({
            color: 0x3d2817,
            shininess: 30
        });
        
        const bean = new THREE.Mesh(beanGeometry, beanMaterial);
        
        // Random position around the cup
        const angle = (i / 20) * Math.PI * 2;
        const radius = 3 + Math.random() * 2;
        bean.position.x = Math.cos(angle) * radius;
        bean.position.y = (Math.random() - 0.5) * 4;
        bean.position.z = Math.sin(angle) * radius;
        
        bean.rotation.x = Math.random() * Math.PI;
        bean.rotation.y = Math.random() * Math.PI;
        
        bean.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            floatSpeed: 0.5 + Math.random() * 0.5,
            floatOffset: Math.random() * Math.PI * 2
        };
        
        beanGroup.add(bean);
    }
    
    scene.add(beanGroup);
    scene.userData.beans = beanGroup;
}

function createSteam() {
    const steamGroup = new THREE.Group();
    
    for (let i = 0; i < 30; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        particle.position.x = (Math.random() - 0.5) * 0.5;
        particle.position.y = 0.8 + Math.random() * 2;
        particle.position.z = (Math.random() - 0.5) * 0.5;
        
        particle.userData = {
            velocity: 0.01 + Math.random() * 0.02,
            initialY: particle.position.y,
            wobble: Math.random() * Math.PI * 2
        };
        
        steamGroup.add(particle);
    }
    
    scene.add(steamGroup);
    scene.userData.steam = steamGroup;
}

function animate() {
    requestAnimationFrame(animate);
    
    // Rotate coffee cup
    if (coffeeCup) {
        coffeeCup.rotation.y += 0.005;
        
        // Mouse interaction
        coffeeCup.rotation.x = mouseY * 0.3;
        coffeeCup.rotation.y += mouseX * 0.3;
    }
    
    // Animate coffee beans
    if (scene.userData.beans) {
        scene.userData.beans.children.forEach((bean, index) => {
            bean.rotation.x += bean.userData.rotationSpeed.x;
            bean.rotation.y += bean.userData.rotationSpeed.y;
            bean.rotation.z += bean.userData.rotationSpeed.z;
            
            // Floating animation
            const time = Date.now() * 0.001;
            bean.position.y += Math.sin(time * bean.userData.floatSpeed + bean.userData.floatOffset) * 0.002;
        });
        
        scene.userData.beans.rotation.y += 0.001;
    }
    
    // Animate steam
    if (scene.userData.steam) {
        scene.userData.steam.children.forEach(particle => {
            particle.position.y += particle.userData.velocity;
            
            // Wobble effect
            particle.userData.wobble += 0.05;
            particle.position.x += Math.sin(particle.userData.wobble) * 0.002;
            
            // Reset particle when it goes too high
            if (particle.position.y > 4) {
                particle.position.y = 0.8;
                particle.position.x = (Math.random() - 0.5) * 0.5;
                particle.position.z = (Math.random() - 0.5) * 0.5;
            }
            
            // Fade out as it rises
            const opacity = 0.3 - ((particle.position.y - 0.8) / 3.2) * 0.3;
            particle.material.opacity = Math.max(0, opacity);
        });
    }
    
    renderer.render(scene, camera);
}

function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.menu-card, .stat-item, .info-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
