class Camera {
    constructor() {
        this.fov = 60;
        this.eye = new Vector3([0,0,3]);
        this.at = new Vector3([0,0,-10]);
        this.up = new Vector3([0,1,0]);
        this.viewMatrix = new Matrix4();
        this.projectionMatrix = new Matrix4();
    }
    setCamera() {
        this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
    }
    moveForward() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(1);
        this.at.set(this.at.add(f));
        this.eye.set(this.eye.add(f));
    }
    moveBackwards() {
        let b = new Vector3();
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(1);
        this.eye.set(this.eye.add(b));
        this.at.set(this.at.add(b));
    }
    moveLeft() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(1);
        this.eye.set(this.eye.add(s));
        this.at.set(this.at.add(s));
    }
    moveRight() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(1);
        this.eye.set(this.eye.add(s));
        this.at.set(this.at.add(s));
    }
    panLeft() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = new Vector3();
        f_prime.set(rotationMatrix.multiplyVector3(f));
        let g = new Vector3();
        g.set(this.eye);
        this.at.set(g.add(f_prime));
    }
    panRight() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = new Vector3();
        f_prime.set(rotationMatrix.multiplyVector3(f));
        let g = new Vector3();
        g.set(this.eye);
        this.at.set(g.add(f_prime));
    }
}