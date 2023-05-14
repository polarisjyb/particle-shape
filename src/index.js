import './style.css'

class Stage {
  constructor() {
    this.renderParam = {
      clearColor: 0x000000,
      width: window.innerWidth,
      height: window.innerHeight
    };
    this.cameraParam = {
      fov: 45,
      near: 0.1,
      far: 100,
      lookAt: new THREE.Vector3(0, 0, 0),
      x: 0,
      y: 0.5,
      z: 4
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.isInitialized = false;
    // this.orbitcontrols = null;
  }

  init() {
    this._setScene();
    this._setRender();
    this._setCamera();
    this.isInitialized = true;
  }

  _setScene() {
    this.scene = new THREE.Scene();
    // this.scene.add(new THREE.GridHelper(1000, 100));
    // this.scene.add(new THREE.AxesHelper(100));
  }

  _setRender() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(new THREE.Color(this.renderParam.clearColor));
    this.renderer.setSize(this.renderParam.width, this.renderParam.height);
    const wrapper = document.querySelector("#webgl");
    wrapper.appendChild(this.renderer.domElement);
  }

  _setCamera() {
    if (!this.isInitialized) {
      this.camera = new THREE.PerspectiveCamera(
        0,
        0,
        this.cameraParam.near,
        this.cameraParam.far
      );

      this.camera.position.set(
        this.cameraParam.x,
        this.cameraParam.y,
        this.cameraParam.z
      );
      this.camera.lookAt(this.cameraParam.lookAt);

      // this.orbitcontrols = new THREE.OrbitControls(
      //     this.camera,
      //     this.renderer.domElement
      // );
      // this.orbitcontrols.enableDamping = true;
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    this.camera.aspect = windowWidth / windowHeight;
    this.camera.fov = this.cameraParam.fov;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(windowWidth, windowHeight);
  }

  _render() {
    this.renderer.render(this.scene, this.camera);
    // this.orbitcontrols.update();
  }

  onResize() {
    this._setCamera();
  }

  onRaf() {
    this._render();
  }
}

class Mesh {
  constructor(stage) {
    this.rotationPower = 0.01;
    this.stage = stage;
  }

  init() {
    this._setMesh();
    this._setScroll();
  }

  _getGeometryPosition(geometry) {
    const numParticles = 10000;
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    const sampler = new THREE.MeshSurfaceSampler(mesh).build();
    const particlesPosition = new Float32Array(numParticles * 3);
    for (let i = 0; i < numParticles; i++) {
      const newPosition = new THREE.Vector3();
      const normal = new THREE.Vector3();

      sampler.sample(newPosition, normal);
      particlesPosition.set([newPosition.x, newPosition.y, newPosition.z],i * 3);
    }

    return particlesPosition;
  }

  _setMesh() {
    const geometry = new THREE.BufferGeometry();
    const firstPos = this._getGeometryPosition(new THREE.SphereBufferGeometry(1, 32, 32).toNonIndexed());
    const secPos = this._getGeometryPosition(new THREE.TorusBufferGeometry(0.7, 0.3, 32, 32).toNonIndexed());
    const thirdPos = this._getGeometryPosition(new THREE.TorusKnotBufferGeometry(0.6, 0.25, 300, 20, 6, 10).toNonIndexed());
    const forthPos = this._getGeometryPosition(new THREE.CylinderBufferGeometry(1, 1, 1, 32, 32).toNonIndexed());
    const fivePos = this._getGeometryPosition(new THREE.IcosahedronBufferGeometry(1.1, 0).toNonIndexed());
    const material = new THREE.RawShaderMaterial({
      vertexShader: document.querySelector("#js-vertex-shader").textContent,
      fragmentShader: document.querySelector("#js-fragment-shader").textContent,
      uniforms: {
        u_sec1: { type: "f", value: 0.0 },
        u_sec2: { type: "f", value: 0.0 },
        u_sec3: { type: "f", value: 0.0 },
        u_sec4: { type: "f", value: 0.0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    geometry.setAttribute("position", new THREE.BufferAttribute(firstPos, 3));
    geometry.setAttribute("secPosition", new THREE.BufferAttribute(secPos, 3));
    geometry.setAttribute("thirdPosition", new THREE.BufferAttribute(thirdPos, 3));
    geometry.setAttribute("forthPosition", new THREE.BufferAttribute(forthPos, 3));
    geometry.setAttribute("fivePosition",new THREE.BufferAttribute(fivePos, 3));

    this.mesh = new THREE.Points(geometry, material);

    this.group = new THREE.Group();
    this.group.add(this.mesh);

    this.stage.scene.add(this.group);
  }

  _setScroll() {
    gsap.timeline({
        defaults: {},
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1
        }
      })
      .to(this.mesh.rotation, {
        x: Math.PI * 2,
        y: Math.PI * 2,
        z: Math.PI * 2
      });

    gsap.to(this.mesh.material.uniforms.u_sec1, {
      value: 1.0,
      scrollTrigger: {
        trigger: ".s-1",
        start: "bottom bottom",
        end: "bottom top",
        scrub: 0.7
      }
    });
    gsap.to(this.mesh.material.uniforms.u_sec2, {
      value: 1.0,
      scrollTrigger: {
        trigger: ".s-2",
        start: "bottom bottom",
        end: "bottom top",
        scrub: 0.7
      }
    });
    gsap.to(this.mesh.material.uniforms.u_sec3, {
      value: 1.0,
      scrollTrigger: {
        trigger: ".s-3",
        start: "bottom bottom",
        end: "bottom top",
        scrub: 0.7
      }
    });
    gsap.to(this.mesh.material.uniforms.u_sec4, {
      value: 1.0,
      scrollTrigger: {
        trigger: ".s-4",
        start: "bottom bottom",
        end: "bottom top",
        scrub: 1
      }
    });
  }

  _render() {
    this.group.rotation.x += this.rotationPower;
    this.group.rotation.y += this.rotationPower;
  }

  onResize() {
    //
  }

  onRaf() {
    this._render();
  }
}

(() => {
  const stage = new Stage();
  stage.init();

  const mesh = new Mesh(stage);
  mesh.init();

  window.addEventListener("resize", () => {
    stage.onResize();
    mesh.onResize();
  });

  const _raf = () => {
    window.requestAnimationFrame(() => {
      stage.onRaf();
      mesh.onRaf();

      _raf();
    });
  };

  _raf();
})();
