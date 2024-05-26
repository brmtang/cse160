class Cube {
    constructor() {
      this.type = 'cube';
      // this.position = [0.0,0.0,0.0];
      this.color = [1.0,1.0,1.0,1.0];
      // this.size = 5.0;
      // this.segments = 10;
      this.matrix = new Matrix4();
      this.textureNum = -2;
    }
    render() {
      // var xy = this.position;
      var rgba = this.color;
      // var size = this.size;
      // var segments = this.segments;
      gl.uniform1i(u_whichTexture, this.textureNum);
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      drawTriangle3DUVNormal([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0], [0,0,-1, 0,0,-1, 0,0,-1]); // front
      drawTriangle3DUVNormal([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);
      drawTriangle3DUVNormal([0,0,1, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], [0,0,1, 0,0,1, 0,0,1]); // back
      drawTriangle3DUVNormal([0,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1]);
      drawTriangle3DUVNormal([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], [0,1,0, 0,1,0, 0,1,0]); // top
      drawTriangle3DUVNormal([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0], [0,1,0, 0,1,0, 0,1,0]);
      drawTriangle3DUVNormal([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]); // right
      drawTriangle3DUVNormal([1,0,0, 1,0,1, 1,1,1], [0,0, 1,0, 1,1], [1,0,0, 1,0,0, 1,0,0]);
      drawTriangle3DUVNormal([0,0,0, 0,1,0, 0,1,1], [0,0, 0,1, 1,1], [-1,0,0, -1,0,0, -1,0,0]); // left
      drawTriangle3DUVNormal([0,0,0, 0,0,1, 0,1,1], [0,0, 1,0, 1,1], [-1,0,0, -1,0,0, -1,0,0]);
      drawTriangle3DUVNormal([0,0,0, 1,0,0, 1,0,1], [0,0, 1,0, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]); // bottom
      drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
    }
  }