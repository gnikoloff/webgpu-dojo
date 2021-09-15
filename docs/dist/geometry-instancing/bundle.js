(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    /**
     * Common utilities
     * @module glMatrix
     */
    var ARRAY_TYPE$1 = typeof Float32Array !== 'undefined' ? Float32Array : Array;
    if (!Math.hypot) Math.hypot = function () {
      var y = 0,
          i = arguments.length;

      while (i--) {
        y += arguments[i] * arguments[i];
      }

      return Math.sqrt(y);
    };

    /**
     * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
     * @module mat4
     */

    /**
     * Creates a new identity mat4
     *
     * @returns {mat4} a new 4x4 matrix
     */

    function create$4() {
      var out = new ARRAY_TYPE$1(16);

      if (ARRAY_TYPE$1 != Float32Array) {
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
      }

      out[0] = 1;
      out[5] = 1;
      out[10] = 1;
      out[15] = 1;
      return out;
    }
    /**
     * Set a mat4 to the identity matrix
     *
     * @param {mat4} out the receiving matrix
     * @returns {mat4} out
     */

    function identity$1(out) {
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = 1;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 1;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    }
    /**
     * Translate a mat4 by the given vector
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to translate
     * @param {ReadonlyVec3} v vector to translate by
     * @returns {mat4} out
     */

    function translate$1(out, a, v) {
      var x = v[0],
          y = v[1],
          z = v[2];
      var a00, a01, a02, a03;
      var a10, a11, a12, a13;
      var a20, a21, a22, a23;

      if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
      } else {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a03;
        out[4] = a10;
        out[5] = a11;
        out[6] = a12;
        out[7] = a13;
        out[8] = a20;
        out[9] = a21;
        out[10] = a22;
        out[11] = a23;
        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
      }

      return out;
    }
    /**
     * Generates a matrix that makes something look at something else.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {ReadonlyVec3} eye Position of the viewer
     * @param {ReadonlyVec3} center Point the viewer is looking at
     * @param {ReadonlyVec3} up vec3 pointing up
     * @returns {mat4} out
     */

    function targetTo(out, eye, target, up) {
      var eyex = eye[0],
          eyey = eye[1],
          eyez = eye[2],
          upx = up[0],
          upy = up[1],
          upz = up[2];
      var z0 = eyex - target[0],
          z1 = eyey - target[1],
          z2 = eyez - target[2];
      var len = z0 * z0 + z1 * z1 + z2 * z2;

      if (len > 0) {
        len = 1 / Math.sqrt(len);
        z0 *= len;
        z1 *= len;
        z2 *= len;
      }

      var x0 = upy * z2 - upz * z1,
          x1 = upz * z0 - upx * z2,
          x2 = upx * z1 - upy * z0;
      len = x0 * x0 + x1 * x1 + x2 * x2;

      if (len > 0) {
        len = 1 / Math.sqrt(len);
        x0 *= len;
        x1 *= len;
        x2 *= len;
      }

      out[0] = x0;
      out[1] = x1;
      out[2] = x2;
      out[3] = 0;
      out[4] = z1 * x2 - z2 * x1;
      out[5] = z2 * x0 - z0 * x2;
      out[6] = z0 * x1 - z1 * x0;
      out[7] = 0;
      out[8] = z0;
      out[9] = z1;
      out[10] = z2;
      out[11] = 0;
      out[12] = eyex;
      out[13] = eyey;
      out[14] = eyez;
      out[15] = 1;
      return out;
    }

    /**
     * 3 Dimensional Vector
     * @module vec3
     */

    /**
     * Creates a new, empty vec3
     *
     * @returns {vec3} a new 3D vector
     */

    function create$3() {
      var out = new ARRAY_TYPE$1(3);

      if (ARRAY_TYPE$1 != Float32Array) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
      }

      return out;
    }
    /**
     * Creates a new vec3 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} a new 3D vector
     */

    function fromValues$1(x, y, z) {
      var out = new ARRAY_TYPE$1(3);
      out[0] = x;
      out[1] = y;
      out[2] = z;
      return out;
    }
    /**
     * Perform some operation over an array of vec3s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */

    (function () {
      var vec = create$3();
      return function (a, stride, offset, count, fn, arg) {
        var i, l;

        if (!stride) {
          stride = 3;
        }

        if (!offset) {
          offset = 0;
        }

        if (count) {
          l = Math.min(count * stride + offset, a.length);
        } else {
          l = a.length;
        }

        for (i = offset; i < l; i += stride) {
          vec[0] = a[i];
          vec[1] = a[i + 1];
          vec[2] = a[i + 2];
          fn(vec, vec, arg);
          a[i] = vec[0];
          a[i + 1] = vec[1];
          a[i + 2] = vec[2];
        }

        return a;
      };
    })();

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    const CUBE_SIDE_FRONT = 'front';
    const CUBE_SIDE_BACK = 'back';
    const CUBE_SIDE_TOP = 'top';
    const CUBE_SIDE_BOTTOM = 'bottom';
    const CUBE_SIDE_LEFT = 'left';
    const CUBE_SIDE_RIGHT = 'right';

    /**
     * Common utilities
     * @module glMatrix
     */
    // Configuration Constants
    var EPSILON = 0.000001;
    var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
    if (!Math.hypot) Math.hypot = function () {
      var y = 0,
          i = arguments.length;

      while (i--) {
        y += arguments[i] * arguments[i];
      }

      return Math.sqrt(y);
    };

    /**
     * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
     * @module mat4
     */

    /**
     * Creates a new identity mat4
     *
     * @returns {mat4} a new 4x4 matrix
     */

    function create() {
      var out = new ARRAY_TYPE(16);

      if (ARRAY_TYPE != Float32Array) {
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
      }

      out[0] = 1;
      out[5] = 1;
      out[10] = 1;
      out[15] = 1;
      return out;
    }
    /**
     * Copy the values from one mat4 to another
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the source matrix
     * @returns {mat4} out
     */

    function copy(out, a) {
      out[0] = a[0];
      out[1] = a[1];
      out[2] = a[2];
      out[3] = a[3];
      out[4] = a[4];
      out[5] = a[5];
      out[6] = a[6];
      out[7] = a[7];
      out[8] = a[8];
      out[9] = a[9];
      out[10] = a[10];
      out[11] = a[11];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
      return out;
    }
    /**
     * Set a mat4 to the identity matrix
     *
     * @param {mat4} out the receiving matrix
     * @returns {mat4} out
     */

    function identity(out) {
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = 1;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 1;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    }
    /**
     * Translate a mat4 by the given vector
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to translate
     * @param {ReadonlyVec3} v vector to translate by
     * @returns {mat4} out
     */

    function translate(out, a, v) {
      var x = v[0],
          y = v[1],
          z = v[2];
      var a00, a01, a02, a03;
      var a10, a11, a12, a13;
      var a20, a21, a22, a23;

      if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
      } else {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a03;
        out[4] = a10;
        out[5] = a11;
        out[6] = a12;
        out[7] = a13;
        out[8] = a20;
        out[9] = a21;
        out[10] = a22;
        out[11] = a23;
        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
      }

      return out;
    }
    /**
     * Scales the mat4 by the dimensions in the given vec3 not using vectorization
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to scale
     * @param {ReadonlyVec3} v the vec3 to scale the matrix by
     * @returns {mat4} out
     **/

    function scale(out, a, v) {
      var x = v[0],
          y = v[1],
          z = v[2];
      out[0] = a[0] * x;
      out[1] = a[1] * x;
      out[2] = a[2] * x;
      out[3] = a[3] * x;
      out[4] = a[4] * y;
      out[5] = a[5] * y;
      out[6] = a[6] * y;
      out[7] = a[7] * y;
      out[8] = a[8] * z;
      out[9] = a[9] * z;
      out[10] = a[10] * z;
      out[11] = a[11] * z;
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
      return out;
    }
    /**
     * Rotates a matrix by the given angle around the X axis
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */

    function rotateX(out, a, rad) {
      var s = Math.sin(rad);
      var c = Math.cos(rad);
      var a10 = a[4];
      var a11 = a[5];
      var a12 = a[6];
      var a13 = a[7];
      var a20 = a[8];
      var a21 = a[9];
      var a22 = a[10];
      var a23 = a[11];

      if (a !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      } // Perform axis-specific matrix multiplication


      out[4] = a10 * c + a20 * s;
      out[5] = a11 * c + a21 * s;
      out[6] = a12 * c + a22 * s;
      out[7] = a13 * c + a23 * s;
      out[8] = a20 * c - a10 * s;
      out[9] = a21 * c - a11 * s;
      out[10] = a22 * c - a12 * s;
      out[11] = a23 * c - a13 * s;
      return out;
    }
    /**
     * Rotates a matrix by the given angle around the Y axis
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */

    function rotateY(out, a, rad) {
      var s = Math.sin(rad);
      var c = Math.cos(rad);
      var a00 = a[0];
      var a01 = a[1];
      var a02 = a[2];
      var a03 = a[3];
      var a20 = a[8];
      var a21 = a[9];
      var a22 = a[10];
      var a23 = a[11];

      if (a !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      } // Perform axis-specific matrix multiplication


      out[0] = a00 * c - a20 * s;
      out[1] = a01 * c - a21 * s;
      out[2] = a02 * c - a22 * s;
      out[3] = a03 * c - a23 * s;
      out[8] = a00 * s + a20 * c;
      out[9] = a01 * s + a21 * c;
      out[10] = a02 * s + a22 * c;
      out[11] = a03 * s + a23 * c;
      return out;
    }
    /**
     * Rotates a matrix by the given angle around the Z axis
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */

    function rotateZ(out, a, rad) {
      var s = Math.sin(rad);
      var c = Math.cos(rad);
      var a00 = a[0];
      var a01 = a[1];
      var a02 = a[2];
      var a03 = a[3];
      var a10 = a[4];
      var a11 = a[5];
      var a12 = a[6];
      var a13 = a[7];

      if (a !== out) {
        // If the source and destination differ, copy the unchanged last row
        out[8] = a[8];
        out[9] = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      } // Perform axis-specific matrix multiplication


      out[0] = a00 * c + a10 * s;
      out[1] = a01 * c + a11 * s;
      out[2] = a02 * c + a12 * s;
      out[3] = a03 * c + a13 * s;
      out[4] = a10 * c - a00 * s;
      out[5] = a11 * c - a01 * s;
      out[6] = a12 * c - a02 * s;
      out[7] = a13 * c - a03 * s;
      return out;
    }
    /**
     * Generates a perspective projection matrix with the given bounds.
     * Passing null/undefined/no value for far will generate infinite projection matrix.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} fovy Vertical field of view in radians
     * @param {number} aspect Aspect ratio. typically viewport width/height
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum, can be null or Infinity
     * @returns {mat4} out
     */

    function perspective(out, fovy, aspect, near, far) {
      var f = 1.0 / Math.tan(fovy / 2),
          nf;
      out[0] = f / aspect;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = f;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[11] = -1;
      out[12] = 0;
      out[13] = 0;
      out[15] = 0;

      if (far != null && far !== Infinity) {
        nf = 1 / (near - far);
        out[10] = (far + near) * nf;
        out[14] = 2 * far * near * nf;
      } else {
        out[10] = -1;
        out[14] = -2 * near;
      }

      return out;
    }
    /**
     * Generates a look-at matrix with the given eye position, focal point, and up axis.
     * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {ReadonlyVec3} eye Position of the viewer
     * @param {ReadonlyVec3} center Point the viewer is looking at
     * @param {ReadonlyVec3} up vec3 pointing up
     * @returns {mat4} out
     */

    function lookAt(out, eye, center, up) {
      var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
      var eyex = eye[0];
      var eyey = eye[1];
      var eyez = eye[2];
      var upx = up[0];
      var upy = up[1];
      var upz = up[2];
      var centerx = center[0];
      var centery = center[1];
      var centerz = center[2];

      if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
        return identity(out);
      }

      z0 = eyex - centerx;
      z1 = eyey - centery;
      z2 = eyez - centerz;
      len = 1 / Math.hypot(z0, z1, z2);
      z0 *= len;
      z1 *= len;
      z2 *= len;
      x0 = upy * z2 - upz * z1;
      x1 = upz * z0 - upx * z2;
      x2 = upx * z1 - upy * z0;
      len = Math.hypot(x0, x1, x2);

      if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
      } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
      }

      y0 = z1 * x2 - z2 * x1;
      y1 = z2 * x0 - z0 * x2;
      y2 = z0 * x1 - z1 * x0;
      len = Math.hypot(y0, y1, y2);

      if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
      } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
      }

      out[0] = x0;
      out[1] = y0;
      out[2] = z0;
      out[3] = 0;
      out[4] = x1;
      out[5] = y1;
      out[6] = z1;
      out[7] = 0;
      out[8] = x2;
      out[9] = y2;
      out[10] = z2;
      out[11] = 0;
      out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
      out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
      out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
      out[15] = 1;
      return out;
    }

    /**
     * 3 Dimensional Vector
     * @module vec3
     */

    /**
     * Creates a new, empty vec3
     *
     * @returns {vec3} a new 3D vector
     */

    function create$1() {
      var out = new ARRAY_TYPE(3);

      if (ARRAY_TYPE != Float32Array) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
      }

      return out;
    }
    /**
     * Creates a new vec3 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} a new 3D vector
     */

    function fromValues(x, y, z) {
      var out = new ARRAY_TYPE(3);
      out[0] = x;
      out[1] = y;
      out[2] = z;
      return out;
    }
    /**
     * Set the components of a vec3 to the given values
     *
     * @param {vec3} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} out
     */

    function set(out, x, y, z) {
      out[0] = x;
      out[1] = y;
      out[2] = z;
      return out;
    }
    /**
     * Adds two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a the first operand
     * @param {ReadonlyVec3} b the second operand
     * @returns {vec3} out
     */

    function add(out, a, b) {
      out[0] = a[0] + b[0];
      out[1] = a[1] + b[1];
      out[2] = a[2] + b[2];
      return out;
    }
    /**
     * Subtracts vector b from vector a
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a the first operand
     * @param {ReadonlyVec3} b the second operand
     * @returns {vec3} out
     */

    function subtract(out, a, b) {
      out[0] = a[0] - b[0];
      out[1] = a[1] - b[1];
      out[2] = a[2] - b[2];
      return out;
    }
    /**
     * Scales a vec3 by a scalar number
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {vec3} out
     */

    function scale$1(out, a, b) {
      out[0] = a[0] * b;
      out[1] = a[1] * b;
      out[2] = a[2] * b;
      return out;
    }
    /**
     * Normalize a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a vector to normalize
     * @returns {vec3} out
     */

    function normalize(out, a) {
      var x = a[0];
      var y = a[1];
      var z = a[2];
      var len = x * x + y * y + z * z;

      if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
      }

      out[0] = a[0] * len;
      out[1] = a[1] * len;
      out[2] = a[2] * len;
      return out;
    }
    /**
     * Alias for {@link vec3.subtract}
     * @function
     */

    var sub = subtract;
    /**
     * Perform some operation over an array of vec3s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */

    (function () {
      var vec = create$1();
      return function (a, stride, offset, count, fn, arg) {
        var i, l;

        if (!stride) {
          stride = 3;
        }

        if (!offset) {
          offset = 0;
        }

        if (count) {
          l = Math.min(count * stride + offset, a.length);
        } else {
          l = a.length;
        }

        for (i = offset; i < l; i += stride) {
          vec[0] = a[i];
          vec[1] = a[i + 1];
          vec[2] = a[i + 2];
          fn(vec, vec, arg);
          a[i] = vec[0];
          a[i + 1] = vec[1];
          a[i + 2] = vec[2];
        }

        return a;
      };
    }());

    /**
     * 2 Dimensional Vector
     * @module vec2
     */

    /**
     * Creates a new, empty vec2
     *
     * @returns {vec2} a new 2D vector
     */

    function create$2() {
      var out = new ARRAY_TYPE(2);

      if (ARRAY_TYPE != Float32Array) {
        out[0] = 0;
        out[1] = 0;
      }

      return out;
    }
    /**
     * Perform some operation over an array of vec2s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */

    (function () {
      var vec = create$2();
      return function (a, stride, offset, count, fn, arg) {
        var i, l;

        if (!stride) {
          stride = 2;
        }

        if (!offset) {
          offset = 0;
        }

        if (count) {
          l = Math.min(count * stride + offset, a.length);
        } else {
          l = a.length;
        }

        for (i = offset; i < l; i += stride) {
          vec[0] = a[i];
          vec[1] = a[i + 1];
          fn(vec, vec, arg);
          a[i] = vec[0];
          a[i + 1] = vec[1];
        }

        return a;
      };
    }());

    /**
     * Base transform class to handle vectors and matrices
     *
     * @public
     */
    class Transform {
        constructor() {
            this.position = fromValues(0, 0, 0);
            this.rotation = fromValues(0, 0, 0);
            this.scale = fromValues(1, 1, 1);
            this.modelMatrix = create();
            this.shouldUpdate = false;
        }
        /**
         * @returns {this}
         */
        copyFromMatrix(matrix) {
            copy(this.modelMatrix, matrix);
            return this;
        }
        /**
         * @returns {this}
         */
        setPosition(position) {
            const { x = this.position[0], y = this.position[1], z = this.position[2], } = position;
            set(this.position, x, y, z);
            this.shouldUpdate = true;
            return this;
        }
        /**
         * Sets scale
         * @returns {this}
         */
        setScale(scale) {
            const { x = this.scale[0], y = this.scale[1], z = this.scale[2] } = scale;
            set(this.scale, x, y, z);
            this.shouldUpdate = true;
            return this;
        }
        /**
         * Sets rotation
         * @returns {this}
         */
        setRotation(rotation) {
            const { x = this.rotation[0], y = this.rotation[1], z = this.rotation[2], } = rotation;
            set(this.rotation, x, y, z);
            this.shouldUpdate = true;
            return this;
        }
        /**
         * Update model matrix with scale, rotation and translation
         * @returns {this}
         */
        updateModelMatrix() {
            identity(this.modelMatrix);
            translate(this.modelMatrix, this.modelMatrix, this.position);
            rotateX(this.modelMatrix, this.modelMatrix, this.rotation[0]);
            rotateY(this.modelMatrix, this.modelMatrix, this.rotation[1]);
            rotateZ(this.modelMatrix, this.modelMatrix, this.rotation[2]);
            scale(this.modelMatrix, this.modelMatrix, this.scale);
            this.shouldUpdate = false;
            return this;
        }
    }
    /**
     * Normalizes a number
     * @param {number} min
     * @param {number} max
     * @param {number} val
     * @returns {number}
     */
    const normalizeNumber = (min, max, val) => (val - min) / (max - min);
    /**
     *
     * @param {number} t
     * @returns {number}
     */
    const triangleWave = (t) => {
        t -= Math.floor(t * 0.5) * 2;
        t = Math.min(Math.max(t, 0), 2);
        return 1 - Math.abs(t - 1);
    };

    class PerspectiveCamera {
        constructor(fieldOfView, aspect, near, far) {
            this.position = [0, 0, 0];
            this.lookAtPosition = [0, 0, 0];
            this.projectionMatrix = create();
            this.viewMatrix = create();
            this.zoom = 1;
            this.fieldOfView = fieldOfView;
            this.aspect = aspect;
            this.near = near;
            this.far = far;
            this.updateProjectionMatrix();
        }
        setPosition({ x = this.position[0], y = this.position[1], z = this.position[2], }) {
            this.position = [x, y, z];
            return this;
        }
        updateViewMatrix() {
            lookAt(this.viewMatrix, this.position, this.lookAtPosition, PerspectiveCamera.UP_VECTOR);
            return this;
        }
        updateProjectionMatrix() {
            perspective(this.projectionMatrix, this.fieldOfView, this.aspect, this.near, this.far);
            return this;
        }
        lookAt(target) {
            this.lookAtPosition = target;
            this.updateViewMatrix();
            return this;
        }
    }
    PerspectiveCamera.UP_VECTOR = [0, 1, 0];

    /**
     * @private
     */
    function buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, u = 0, v = 1, w = 2, uDir = 1, vDir = -1, i = 0, ii = 0) {
        const io = i;
        const segW = width / wSegs;
        const segH = height / hSegs;
        for (let iy = 0; iy <= hSegs; iy++) {
            const y = iy * segH - height / 2;
            for (let ix = 0; ix <= wSegs; ix++, i++) {
                const x = ix * segW - width / 2;
                vertices[i * 3 + u] = x * uDir;
                vertices[i * 3 + v] = y * vDir;
                vertices[i * 3 + w] = depth / 2;
                normal[i * 3 + u] = 0;
                normal[i * 3 + v] = 0;
                normal[i * 3 + w] = depth >= 0 ? 1 : -1;
                uv[i * 2] = ix / wSegs;
                uv[i * 2 + 1] = 1 - iy / hSegs;
                if (iy === hSegs || ix === wSegs)
                    continue;
                const a = io + ix + iy * (wSegs + 1);
                const b = io + ix + (iy + 1) * (wSegs + 1);
                const c = io + ix + (iy + 1) * (wSegs + 1) + 1;
                const d = io + ix + iy * (wSegs + 1) + 1;
                indices[ii * 6] = a;
                indices[ii * 6 + 1] = b;
                indices[ii * 6 + 2] = d;
                indices[ii * 6 + 3] = b;
                indices[ii * 6 + 4] = c;
                indices[ii * 6 + 5] = d;
                ii++;
            }
        }
    }

    /**
     * Generates geometry data for a box
     * @param {Box} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createBox(params = {}) {
        const { width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1, } = params;
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        const dSegs = depthSegments;
        const num = (wSegs + 1) * (hSegs + 1) * 2 +
            (wSegs + 1) * (dSegs + 1) * 2 +
            (hSegs + 1) * (dSegs + 1) * 2;
        const numIndices = (wSegs * hSegs * 2 + wSegs * dSegs * 2 + hSegs * dSegs * 2) * 6;
        const vertices = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
        let i = 0;
        let ii = 0;
        {
            // RIGHT
            buildPlane(vertices, normal, uv, indices, depth, height, width, dSegs, hSegs, 2, 1, 0, -1, -1, i, ii);
        }
        {
            // LEFT
            buildPlane(vertices, normal, uv, indices, depth, height, -width, dSegs, hSegs, 2, 1, 0, 1, -1, (i += (dSegs + 1) * (hSegs + 1)), (ii += dSegs * hSegs));
        }
        {
            // TOP
            buildPlane(vertices, normal, uv, indices, width, depth, height, dSegs, hSegs, 0, 2, 1, 1, 1, (i += (dSegs + 1) * (hSegs + 1)), (ii += dSegs * hSegs));
        }
        {
            // BOTTOM
            buildPlane(vertices, normal, uv, indices, width, depth, -height, dSegs, hSegs, 0, 2, 1, 1, -1, (i += (wSegs + 1) * (dSegs + 1)), (ii += wSegs * dSegs));
        }
        {
            // BACK
            buildPlane(vertices, normal, uv, indices, width, height, -depth, wSegs, hSegs, 0, 1, 2, -1, -1, (i += (wSegs + 1) * (dSegs + 1)), (ii += wSegs * dSegs));
        }
        {
            // FRONT
            buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, 0, 1, 2, 1, -1, (i += (wSegs + 1) * (hSegs + 1)), (ii += wSegs * hSegs));
        }
        return {
            vertices,
            normal,
            uv,
            indices,
        };
    }

    /**
     * Generates geometry data for a box
     * @param {Box} params
     * @returns {[{ vertices, normal, uv, indices, orientation }]}
     */
    function createBoxSeparateFace(params = {}) {
        const { width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1, } = params;
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        const dSegs = depthSegments;
        const sidesData = [];
        const i = 0;
        const ii = 0;
        {
            // RIGHT
            const num = (dSegs + 1) * (hSegs + 1);
            const numIndices = dSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, depth, height, width, dSegs, hSegs, 2, 1, 0, -1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_RIGHT,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // LEFT
            const num = (dSegs + 1) * (hSegs + 1);
            const numIndices = dSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, depth, height, -width, dSegs, hSegs, 2, 1, 0, 1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_LEFT,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // TOP
            const num = (dSegs + 1) * (hSegs + 1);
            const numIndices = dSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, width, depth, height, dSegs, hSegs, 0, 2, 1, 1, 1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_TOP,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // BOTTOM
            const num = (dSegs + 1) * (hSegs + 1);
            const numIndices = dSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, width, depth, -height, dSegs, hSegs, 0, 2, 1, 1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_BOTTOM,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // BACK
            const num = (wSegs + 1) * (dSegs + 1);
            const numIndices = wSegs * dSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, width, height, -depth, wSegs, hSegs, 0, 1, 2, -1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_BACK,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // FRONT
            const num = (wSegs + 1) * (hSegs + 1);
            const numIndices = wSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, 0, 1, 2, 1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_FRONT,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        return sidesData;
    }

    // @ts-nocheck
    // Handle Simple 90 Degree Rotations without the use of Quat,Trig,Matrices
    class VRot90 {
        // #region SINGLE AXIS ROTATION
        static xp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = x;
            o[1] = -z;
            o[2] = y;
            return o;
        } // x-zy rot x+90
        static xn(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = x;
            o[1] = z;
            o[2] = -y;
            return o;
        } // xz-y rot x-90
        static yp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = -z;
            o[1] = y;
            o[2] = x;
            return o;
        } // -zyx rot y+90
        static yn(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = z;
            o[1] = y;
            o[2] = -x;
            return o;
        } // zy-x rot y-90
        static zp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = y;
            o[1] = -x;
            o[2] = z;
            return o;
        } // y-xz rot z+90
        static zn(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = -y;
            o[1] = x;
            o[2] = z;
            return o;
        } // -yxz rot z-90
        // #endregion
        // #region COMBINATIONS
        static xp_yn(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = -y;
            o[1] = -z;
            o[2] = x;
            return o;
        } // -y-zx rot x+90, y-90
        static xp_yp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = y;
            o[1] = -z;
            o[2] = -x;
            return o;
        } // y-z-x rot x+90, y+90
        static xp_yp_yp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = -x;
            o[1] = -z;
            o[2] = -y;
            return o;
        } // -x-z-y rot x+90, y+90, y+90
        static xp_xp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = x;
            o[1] = -y;
            o[2] = -z;
            return o;
        } // x-y-z rot x+90, x+90
    }
    const createRoundedBox = ({ width = 1, height = 1, depth = 1, radius = 0.5, div = 4, }) => {
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const panel = edge_grid(width, height, depth, radius, div); // Creates the Geo of just the Top Plane of the
        const geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // TODO, Knowing the Plane's Vert Count, It would be better to pre-allocate all the space
        // in TypedArrays then fill in all the data. Using Javascript arrays makes things simple
        // for programming but isn't as efficent.
        // Rotate and Merge the Panel Data into one Geo to form a Rounded Quad
        geo_rot_merge(geo, panel, (v, o) => {
            o[0] = v[0];
            o[1] = v[1];
            o[2] = v[2];
            return o;
        }); // Top - No Rotation, Kind of a Waste
        geo_rot_merge(geo, panel, VRot90.xp); // Front
        geo_rot_merge(geo, panel, VRot90.xp_yp); // Left
        geo_rot_merge(geo, panel, VRot90.xp_yp_yp); // Back
        geo_rot_merge(geo, panel, VRot90.xp_yn); // Right
        geo_rot_merge(geo, panel, VRot90.xp_xp); // Bottom
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return {
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        };
    };
    // Generate a Plane where all its vertices are focus onto the corners
    // Then those corners are sphere-ified to create rounded corners on the plane
    function edge_grid(width = 2, height = 2, depth = 2, radius = 0.5, div = 4) {
        const mx = width / 2, my = height / 2, mz = depth / 2, len = div * 2;
        const verts = [];
        const uv = [];
        const norm = [];
        const v = create$1();
        let bit, j, i, t, s, x, y, z;
        y = my;
        // Use corners kinda like Marching Squares
        const corners = [
            fromValues(radius - mx, my - radius, radius - mz),
            fromValues(mx - radius, my - radius, radius - mz),
            fromValues(radius - mx, my - radius, mz - radius),
            fromValues(mx - radius, my - radius, mz - radius),
        ];
        const row = (z, zbit) => {
            let t, bit;
            const uv_z = normalizeNumber(-mz, mz, z); // Map Z and Normalize the Value
            for (i = 0; i <= len; i++) {
                bit = i <= div ? 0 : 1;
                t = triangleWave(i / div); // 0 > 1 > 0
                s = i <= div ? -1 : 1; // Sign
                x = mx * s + radius * t * -s; // Flip Signs based if i <= div
                set(v, x, y, z);
                sub(v, v, corners[bit | zbit]);
                normalize(v, v);
                norm.push(v[0], v[1], v[2]); // Save it
                scale$1(v, v, radius);
                add(v, v, corners[bit | zbit]);
                verts.push(v[0], v[1], v[2]); // Save Vert
                uv.push(normalizeNumber(-mx, mx, x), uv_z);
                //App.Debug.pnt( v );
                // Start the mirror side when done with the first side
                if (t == 1) {
                    set(v, mx - radius, y, z);
                    sub(v, v, corners[1 | zbit]);
                    normalize(v, v);
                    norm.push(v[0], v[1], v[2]);
                    scale$1(v, v, radius);
                    add(v, v, corners[1 | zbit]);
                    verts.push(v[0], v[1], v[2]);
                    uv.push(normalizeNumber(-mx, mx, mx - radius), uv_z);
                    // App.Debug.pnt( v );
                }
            }
        };
        for (j = 0; j <= len; j++) {
            // Compute Z Position
            bit = j <= div ? 0 : 2;
            t = triangleWave(j / div); // 0 > 1 > 0
            s = j <= div ? -1 : 1; // Sign
            z = mz * s + radius * t * -s; // Flip Signs based if i <= div
            row(z, bit); // Draw Row
            if (t == 1)
                row(mz - radius, 2); // Start Mirror Side
        }
        return { verts, uv, norm, indices: grid_tri_idx(len + 1, len + 1) };
    }
    // Rotate Vertices/Normals, then Merge All the Vertex Attributes into One Geo
    function geo_rot_merge(geo, obj, fn_rot) {
        const offset = geo.verts.length / 3;
        const len = obj.verts.length;
        const v = create$1(), o = create$1();
        for (let i = 0; i < len; i += 3) {
            // Rotate Vertices
            set(v, obj.verts[i], obj.verts[i + 1], obj.verts[i + 2]);
            fn_rot(v, o);
            geo.verts.push(o[0], o[1], o[2]);
            // Rotate Normal
            set(v, obj.norm[i], obj.norm[i + 1], obj.norm[i + 2]);
            fn_rot(v, o);
            geo.norm.push(o[0], o[1], o[2]);
        }
        for (const v of obj.uv) {
            geo.uv.push(v);
        }
        for (const v of obj.indices) {
            geo.indices.push(offset + v);
        }
    }
    // Generate Indices for a Grid Mesh
    function grid_tri_idx(x_cells, y_cells) {
        let ary = [], col_cnt = x_cells + 1, x, y, a, b, c, d;
        for (y = 0; y < y_cells; y++) {
            for (x = 0; x < x_cells; x++) {
                a = y * col_cnt + x;
                b = a + col_cnt;
                c = b + 1;
                d = a + 1;
                ary.push(a, b, c, c, d, a);
            }
        }
        return ary;
    }

    // @ts-nocheck
    const createRoundedBoxSeparateFace = ({ width = 1, height = 1, depth = 1, radius = 0.5, div = 4, }) => {
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const panel = edge_grid$1(width, height, depth, radius, div); // Create
        const sidesData = [];
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // TODO, Knowing the Plane's Vert Count, It would be better to pre-allocate all the space
        // in TypedArrays then fill in all the data. Using Javascript arrays makes things simple
        // for programming but isn't as efficent.
        // Rotate and Merge the Panel Data into one Geo to form a Rounded Quad
        let geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge$1(geo, panel, (v, o) => {
            o[0] = v[0];
            o[1] = v[1];
            o[2] = v[2];
            return o;
        }); // Top - No Rotation, Kind of a Waste
        sidesData.push({
            orientation: 'top',
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge$1(geo, panel, VRot90.xp); // Front
        sidesData.push({
            orientation: CUBE_SIDE_FRONT,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge$1(geo, panel, VRot90.xp_yp); // Left
        sidesData.push({
            orientation: CUBE_SIDE_LEFT,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge$1(geo, panel, VRot90.xp_yp_yp); // Back
        sidesData.push({
            orientation: CUBE_SIDE_BACK,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge$1(geo, panel, VRot90.xp_yn); // Right
        sidesData.push({
            orientation: CUBE_SIDE_RIGHT,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge$1(geo, panel, VRot90.xp_xp); // Bottom
        sidesData.push({
            orientation: CUBE_SIDE_BOTTOM,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return sidesData;
    };
    // Generate a Plane where all its vertices are focus onto the corners
    // Then those corners are sphere-ified to create rounded corners on the plane
    function edge_grid$1(width = 2, height = 2, depth = 2, radius = 0.5, div = 4) {
        const mx = width / 2, my = height / 2, mz = depth / 2, len = div * 2;
        const verts = [];
        const uv = [];
        const norm = [];
        const v = create$1();
        let bit, j, i, t, s, x, y, z;
        y = my;
        // Use corners kinda like Marching Squares
        const corners = [
            fromValues(radius - mx, my - radius, radius - mz),
            fromValues(mx - radius, my - radius, radius - mz),
            fromValues(radius - mx, my - radius, mz - radius),
            fromValues(mx - radius, my - radius, mz - radius),
        ];
        const row = (z, zbit) => {
            let t, bit;
            const uv_z = normalizeNumber(-mz, mz, z); // Map Z and Normalize the Value
            for (i = 0; i <= len; i++) {
                bit = i <= div ? 0 : 1;
                t = triangleWave(i / div); // 0 > 1 > 0
                s = i <= div ? -1 : 1; // Sign
                x = mx * s + radius * t * -s; // Flip Signs based if i <= div
                set(v, x, y, z);
                sub(v, v, corners[bit | zbit]);
                normalize(v, v);
                norm.push(v[0], v[1], v[2]); // Save it
                scale$1(v, v, radius);
                add(v, v, corners[bit | zbit]);
                verts.push(v[0], v[1], v[2]); // Save Vert
                uv.push(normalizeNumber(-mx, mx, x), uv_z);
                //App.Debug.pnt( v );
                // Start the mirror side when done with the first side
                if (t == 1) {
                    set(v, mx - radius, y, z);
                    sub(v, v, corners[1 | zbit]);
                    normalize(v, v);
                    norm.push(v[0], v[1], v[2]);
                    scale$1(v, v, radius);
                    add(v, v, corners[1 | zbit]);
                    verts.push(v[0], v[1], v[2]);
                    uv.push(normalizeNumber(-mx, mx, mx - radius), uv_z);
                    // App.Debug.pnt( v );
                }
            }
        };
        for (j = 0; j <= len; j++) {
            // Compute Z Position
            bit = j <= div ? 0 : 2;
            t = triangleWave(j / div); // 0 > 1 > 0
            s = j <= div ? -1 : 1; // Sign
            z = mz * s + radius * t * -s; // Flip Signs based if i <= div
            row(z, bit); // Draw Row
            if (t == 1)
                row(mz - radius, 2); // Start Mirror Side
        }
        return { verts, uv, norm, indices: grid_tri_idx$1(len + 1, len + 1) };
    }
    // Rotate Vertices/Normals, then Merge All the Vertex Attributes into One Geo
    function geo_rot_merge$1(geo, obj, fn_rot) {
        const offset = geo.verts.length / 3;
        const len = obj.verts.length;
        const v = create$1(), o = create$1();
        for (let i = 0; i < len; i += 3) {
            // Rotate Vertices
            set(v, obj.verts[i], obj.verts[i + 1], obj.verts[i + 2]);
            fn_rot(v, o);
            geo.verts.push(o[0], o[1], o[2]);
            // Rotate Normal
            set(v, obj.norm[i], obj.norm[i + 1], obj.norm[i + 2]);
            fn_rot(v, o);
            geo.norm.push(o[0], o[1], o[2]);
        }
        for (const v of obj.uv) {
            geo.uv.push(v);
        }
        for (const v of obj.indices) {
            geo.indices.push(offset + v);
        }
    }
    // Generate Indices for a Grid Mesh
    function grid_tri_idx$1(x_cells, y_cells) {
        let ary = [], col_cnt = x_cells + 1, x, y, a, b, c, d;
        for (y = 0; y < y_cells; y++) {
            for (x = 0; x < x_cells; x++) {
                a = y * col_cnt + x;
                b = a + col_cnt;
                c = b + 1;
                d = a + 1;
                ary.push(a, b, c, c, d, a);
            }
        }
        return ary;
    }

    /**
     * @description Generate circle geometry
     * @param {Circle} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createCircle(params = {}) {
        const { radius = 1, segments = 8, thetaStart = 0, thetaLength = Math.PI * 2, } = params;
        const indices = [];
        const vertices = [];
        const normals = [];
        const uvs = [];
        // helper variables
        const vertex = create$1();
        const uv = create$2();
        // center point
        vertices.push(0, 0, 0);
        normals.push(0, 0, 1);
        uvs.push(0.5, 0.5);
        for (let s = 0, i = 3; s <= segments; s++, i += 3) {
            const segment = thetaStart + s / segments * thetaLength;
            // vertex
            vertex[0] = radius * Math.cos(segment);
            vertex[1] = radius * Math.sin(segment);
            vertices.push(...vertex);
            // normal
            normals.push(0, 0, 1);
            // uvs
            uv[0] = (vertices[i] / radius + 1) / 2;
            uv[1] = (vertices[i + 1] / radius + 1) / 2;
            uvs.push(uv[0], uv[1]);
        }
        // indices
        for (let i = 1; i <= segments; i++) {
            indices.push(i, i + 1, 0);
        }
        return {
            indices: segments > 65536 ? new Uint32Array(indices) : new Uint16Array(indices),
            vertices: new Float32Array(vertices),
            normal: new Float32Array(normals),
            uv: new Float32Array(uvs),
        };
    }

    /**
     * Generates geometry data for a quad
     * @param {PlaneInterface} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createPlane(params = {}) {
        const { width = 1, height = 1, widthSegments = 1, heightSegments = 1, } = params;
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        // Determine length of arrays
        const num = (wSegs + 1) * (hSegs + 1);
        const numIndices = wSegs * hSegs * 6;
        // Generate empty arrays once
        const position = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const index = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
        buildPlane(position, normal, uv, index, width, height, 0, wSegs, hSegs);
        return {
            vertices: position,
            normal,
            uv,
            indices: index,
        };
    }

    /**
     * Generates geometry data for a sphere
     * @param {Sphere} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createSphere(params = {}) {
        const { radius = 0.5, widthSegments = 16, heightSegments = Math.ceil(widthSegments * 0.5), phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI, } = params;
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        const pStart = phiStart;
        const pLength = phiLength;
        const tStart = thetaStart;
        const tLength = thetaLength;
        const num = (wSegs + 1) * (hSegs + 1);
        const numIndices = wSegs * hSegs * 6;
        const position = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const index = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
        let i = 0;
        let iv = 0;
        let ii = 0;
        const te = tStart + tLength;
        const grid = [];
        const n = create$1();
        for (let iy = 0; iy <= hSegs; iy++) {
            const vRow = [];
            const v = iy / hSegs;
            for (let ix = 0; ix <= wSegs; ix++, i++) {
                const u = ix / wSegs;
                const x = -radius *
                    Math.cos(pStart + u * pLength) *
                    Math.sin(tStart + v * tLength);
                const y = radius * Math.cos(tStart + v * tLength);
                const z = radius * Math.sin(pStart + u * pLength) * Math.sin(tStart + v * tLength);
                position[i * 3] = x;
                position[i * 3 + 1] = y;
                position[i * 3 + 2] = z;
                set(n, x, y, z);
                normalize(n, n);
                normal[i * 3] = n[0];
                normal[i * 3 + 1] = n[1];
                normal[i * 3 + 2] = n[2];
                uv[i * 2] = u;
                uv[i * 2 + 1] = 1 - v;
                vRow.push(iv++);
            }
            grid.push(vRow);
        }
        for (let iy = 0; iy < hSegs; iy++) {
            for (let ix = 0; ix < wSegs; ix++) {
                const a = grid[iy][ix + 1];
                const b = grid[iy][ix];
                const c = grid[iy + 1][ix];
                const d = grid[iy + 1][ix + 1];
                if (iy !== 0 || tStart > 0) {
                    index[ii * 3] = a;
                    index[ii * 3 + 1] = b;
                    index[ii * 3 + 2] = d;
                    ii++;
                }
                if (iy !== hSegs - 1 || te < Math.PI) {
                    index[ii * 3] = b;
                    index[ii * 3 + 1] = c;
                    index[ii * 3 + 2] = d;
                    ii++;
                }
            }
        }
        return {
            vertices: position,
            normal,
            uv,
            indices: index,
        };
    }

    /**
     * @description Generate torus geometry
     * @param {Torus} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createTorus(params = {}) {
        const { radius = 0.5, tube = 0.35, arc = Math.PI * 2, radialSegments: inputRadialSegments = 8, tubularSegments: inputTubularSegments = 6, } = params;
        const radialSegments = Math.floor(inputRadialSegments);
        const tubularSegments = Math.floor(inputTubularSegments);
        const indices = [];
        const vertices = [];
        const normals = [];
        const uvs = [];
        const center = create$1();
        const vertex = create$1();
        const normal = create$1();
        for (let j = 0; j <= radialSegments; j++) {
            for (let i = 0; i <= tubularSegments; i++) {
                const u = (i / tubularSegments) * arc;
                const v = (j / radialSegments) * Math.PI * 2;
                // vertex
                vertex[0] = (radius + tube * Math.cos(v)) * Math.cos(u);
                vertex[1] = (radius + tube * Math.cos(v)) * Math.sin(u);
                vertex[2] = tube * Math.sin(v);
                vertices.push(vertex[0], vertex[1], vertex[2]);
                // normal
                center[0] = radius * Math.cos(u);
                center[1] = radius * Math.sin(u);
                sub(normal, vertex, center);
                normalize(normal, normal);
                normals.push(normal[0], normal[1], normal[0]);
                // uv
                uvs.push(i / tubularSegments, j / radialSegments);
            }
        }
        // generate indices
        for (let j = 1; j <= radialSegments; j++) {
            for (let i = 1; i <= tubularSegments; i++) {
                // indices
                const a = (tubularSegments + 1) * j + i - 1;
                const b = (tubularSegments + 1) * (j - 1) + i - 1;
                const c = (tubularSegments + 1) * (j - 1) + i;
                const d = (tubularSegments + 1) * j + i;
                // faces
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }
        const num = (radialSegments + 1) * (tubularSegments + 1);
        return {
            indices: num > 65536 ? new Uint32Array(indices) : new Uint16Array(indices),
            vertices: new Float32Array(vertices),
            normal: new Float32Array(normals),
            uv: new Float32Array(uvs),
        };
    }

    /**
     * @namespace GeometryUtils
     */
    const GeometryUtils = {
        createBox,
        createBoxSeparateFace,
        createRoundedBoxSeparateFace,
        createRoundedBox,
        createCircle,
        createPlane,
        createSphere,
        createTorus,
    };

    var index = /*#__PURE__*/Object.freeze({
        __proto__: null,
        createBox: createBox,
        createBoxSeparateFace: createBoxSeparateFace,
        createRoundedBoxSeparateFace: createRoundedBoxSeparateFace,
        createRoundedBox: createRoundedBox,
        createCircle: createCircle,
        createPlane: createPlane,
        createSphere: createSphere,
        createTorus: createTorus,
        GeometryUtils: GeometryUtils
    });

    var VERTEX_SHADER = "\n[[block]]\nstruct Uniforms {\n  projectionMatrix: mat4x4<f32>;\n  viewMatrix: mat4x4<f32>;\n  modelMatrix: mat4x4<f32>;\n};\n[[group(0), binding(0)]]\nvar<uniform> uniforms: Uniforms;\n\n[[block]]\nstruct InstancedTransform {\n  instanceModelMatrix: [[stride(64)]] array<mat4x4<f32>, 16>;\n};\n[[group(0), binding(1)]]\nvar<uniform> instancedTransform: InstancedTransform;\n\nstruct Input {\n  [[builtin(instance_index)]] instanceIdx : u32;\n  [[location(0)]] position: vec4<f32>;\n  [[location(1)]] normal: vec3<f32>;\n};\n\nstruct Output {\n  [[builtin(position)]] Position: vec4<f32>;\n  [[location(0)]] normal: vec3<f32>;\n};\n\n[[stage(vertex)]]\nfn main (input: Input) -> Output {\n  var output: Output;\n\n  let instancePos: vec4<f32> = uniforms.modelMatrix *\n                    instancedTransform.instanceModelMatrix[input.instanceIdx] *\n                    input.position;\n  \n  \n  output.Position = uniforms.projectionMatrix *\n                    uniforms.viewMatrix *\n                    uniforms.modelMatrix *\n                    instancedTransform.instanceModelMatrix[input.instanceIdx] *\n                    input.position;\n                    \n  output.normal = input.normal;\n\n  return output;\n}\n"; // eslint-disable-line

    var FRAGMENT_SHADER = "\n[[group(0), binding(2)]] var mySampler: sampler;\n[[group(0), binding(3)]] var myTexture: texture_2d<f32>;\n\nstruct Input {\n  [[location(0)]] normal: vec3<f32>;\n};\n\n[[stage(fragment)]]\n\nfn main (input: Input) -> [[location(0)]] vec4<f32> {\n  return textureSample(myTexture, mySampler, normalize(input.normal).xy * 0.5 + 0.5);\n}\n"; // eslint-disable-line

    const UP_VECTOR = fromValues$1(0, 1, 0);
    const SAMPLE_COUNT = 4;
    const COUNT_X = 4;
    const COUNT_Y = 4;
    const WORLD_SIZE_X = 5;
    const WORLD_SIZE_Y = 5;
    const NUM_INSTANCES = COUNT_X * COUNT_Y;
    (() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const canvas = document.getElementById('gpu-c');
        canvas.width = innerWidth * devicePixelRatio;
        canvas.height = innerHeight * devicePixelRatio;
        canvas.style.setProperty('width', `${innerWidth}px`);
        canvas.style.setProperty('height', `${innerHeight}px`);
        const adapter = yield ((_a = navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter());
        const device = yield (adapter === null || adapter === void 0 ? void 0 : adapter.requestDevice());
        const context = canvas.getContext('webgpu');
        const presentationFormat = context.getPreferredFormat(adapter);
        const primitiveType = 'triangle-list';
        context.configure({
            device,
            format: presentationFormat,
        });
        const { vertices, normal, indices } = index.createSphere({
            widthSegments: 32,
            heightSegments: 32,
        });
        const vertexBuffer = device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
        vertexBuffer.unmap();
        const normalBuffer = device.createBuffer({
            size: normal.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(normalBuffer.getMappedRange()).set(normal);
        normalBuffer.unmap();
        const indexBuffer = device.createBuffer({
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        if (indices instanceof Uint16Array) {
            new Uint16Array(indexBuffer.getMappedRange()).set(indices);
        }
        else {
            new Uint32Array(indexBuffer.getMappedRange()).set(indices);
        }
        indexBuffer.unmap();
        const pipeline = device.createRenderPipeline({
            vertex: {
                module: device.createShaderModule({
                    code: VERTEX_SHADER,
                }),
                entryPoint: 'main',
                buffers: [
                    {
                        arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
                        attributes: [
                            {
                                shaderLocation: 0,
                                format: 'float32x3',
                                offset: 0,
                            },
                        ],
                    },
                    {
                        arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
                        attributes: [
                            {
                                shaderLocation: 1,
                                format: 'float32x3',
                                offset: 0,
                            },
                        ],
                    },
                ],
            },
            fragment: {
                module: device.createShaderModule({
                    code: FRAGMENT_SHADER,
                }),
                entryPoint: 'main',
                targets: [
                    {
                        format: presentationFormat,
                    },
                ],
            },
            primitive: {
                topology: primitiveType,
                stripIndexFormat: undefined,
                // cullMode: 'back',
            },
            multisample: {
                count: SAMPLE_COUNT,
            },
            depthStencil: {
                format: 'depth24plus',
                depthWriteEnabled: true,
                depthCompare: 'less',
            },
        });
        const image = new Image();
        image.src = '/webgpu-dojo/dist/assets/eye-texture.jpeg';
        yield image.decode();
        const imageBitmap = yield createImageBitmap(image);
        const cubeTexture = device.createTexture({
            size: [imageBitmap.width, imageBitmap.height, 1],
            format: presentationFormat,
            usage: GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });
        device.queue.copyExternalImageToTexture({ source: imageBitmap }, { texture: cubeTexture }, [imageBitmap.width, imageBitmap.height]);
        const sampler = device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
        });
        const vertexUniformBuffer = device.createBuffer({
            size: 16 * 3 * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        const instanceVertexUniformBuffer = device.createBuffer({
            size: NUM_INSTANCES * 16 * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        const instancePositionsVertexUniformBuffer = device.createBuffer({
            size: NUM_INSTANCES * 3 * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        const instanceMatrix = new Float32Array(16 * NUM_INSTANCES);
        const instancePositions = new Float32Array(3 * NUM_INSTANCES);
        const tempEyeTransformMatrix = create$4();
        device.queue.writeBuffer(instancePositionsVertexUniformBuffer, 0, instancePositions);
        const uniformBindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: vertexUniformBuffer,
                    },
                },
                {
                    binding: 1,
                    resource: {
                        buffer: instanceVertexUniformBuffer,
                    },
                },
                // {
                //   binding: 2,
                //   resource: {
                //     buffer: instancePositionsVertexUniformBuffer,
                //   },
                // },
                {
                    binding: 2,
                    resource: sampler,
                },
                {
                    binding: 3,
                    resource: cubeTexture.createView(),
                },
            ],
        });
        const cameraFOV = (45 * Math.PI) / 180;
        const cameraAspect = canvas.width / canvas.height;
        const cameraPosZ = 7;
        const cameraFrustumHeight = 2 * Math.tan(cameraFOV / 2) * cameraPosZ; // visible height
        const cameraFrustumWidth = cameraFrustumHeight * (innerWidth / innerHeight);
        const perspCamera = new PerspectiveCamera(cameraFOV, cameraAspect, 0.1, 100);
        perspCamera.setPosition({ x: 0, y: 0, z: cameraPosZ });
        perspCamera.lookAt([0, 0, 0]);
        perspCamera.updateProjectionMatrix();
        perspCamera.updateViewMatrix();
        const cubeTransform = new Transform();
        const textureDepth = device.createTexture({
            size: [canvas.width, canvas.height, 1],
            format: 'depth24plus',
            sampleCount: SAMPLE_COUNT,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        const renderTexture = device.createTexture({
            size: [canvas.width, canvas.height],
            sampleCount: SAMPLE_COUNT,
            format: presentationFormat,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        let textureView = renderTexture.createView();
        const mousePos = new Float32Array([0, 0]);
        const mousePosTarget = new Float32Array([0, 0]);
        let clickFactor = 0;
        let clickFactorTarget = clickFactor;
        let oldTime = 0;
        requestAnimationFrame(drawFrame);
        document.body.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('click', onMouseClick);
        function onMouseMove(e) {
            const x = ((e.pageX / innerWidth) * 2 - 1) * cameraFrustumWidth * 0.5;
            const y = ((1 - e.pageY / innerHeight) * 2 - 1) * cameraFrustumHeight * 0.5;
            mousePosTarget[0] = x;
            mousePosTarget[1] = y;
        }
        function onMouseClick() {
            clickFactorTarget++;
        }
        function drawFrame(ts) {
            requestAnimationFrame(drawFrame);
            ts /= 1000;
            const dt = ts - oldTime;
            oldTime = ts;
            const clickMoveSpeed = dt * 5;
            clickFactorTarget += -clickFactorTarget * clickMoveSpeed;
            clickFactor += (clickFactorTarget - clickFactor) * clickMoveSpeed;
            const commandEncoder = device.createCommandEncoder();
            const renderPass = commandEncoder.beginRenderPass({
                colorAttachments: [
                    {
                        view: textureView,
                        resolveTarget: context.getCurrentTexture().createView(),
                        loadValue: [0.1, 0.1, 0.1, 1.0],
                        storeOp: 'store',
                    },
                ],
                depthStencilAttachment: {
                    view: textureDepth.createView(),
                    depthLoadValue: 1,
                    depthStoreOp: 'store',
                    stencilLoadValue: 0,
                    stencilStoreOp: 'store',
                },
            });
            device.queue.writeBuffer(vertexUniformBuffer, 0, perspCamera.projectionMatrix);
            device.queue.writeBuffer(vertexUniformBuffer, 16 * Float32Array.BYTES_PER_ELEMENT, perspCamera.viewMatrix);
            device.queue.writeBuffer(vertexUniformBuffer, 16 * 2 * Float32Array.BYTES_PER_ELEMENT, cubeTransform.modelMatrix);
            const lookAtSpeed = dt * 1;
            mousePos[0] += (mousePosTarget[0] - mousePos[0]) * lookAtSpeed;
            mousePos[1] += (mousePosTarget[1] - mousePos[1]) * lookAtSpeed;
            let n = 0;
            const deltaX = WORLD_SIZE_X / COUNT_X;
            const deltaY = WORLD_SIZE_Y / COUNT_Y;
            for (let x = 0; x < COUNT_X; x++) {
                for (let y = 0; y < COUNT_Y; y++) {
                    const offsetX = Math.cos(n) * 2;
                    const offsetY = Math.sin(n) * 2;
                    const offsetZ = Math.sin(n * 2) * n;
                    const worldX = x * deltaX - WORLD_SIZE_X / 2 + 0.5 + offsetX * clickFactor;
                    const worldY = y * deltaY - WORLD_SIZE_Y / 2 + 0.5 + offsetY * clickFactor;
                    const mixX = worldX + (offsetX - worldX) * clickFactor;
                    const mixY = worldY + (offsetY - worldY) * clickFactor;
                    const mixZ = offsetZ * clickFactor;
                    const worldXYZ = fromValues$1(mixX, mixY, mixZ);
                    identity$1(tempEyeTransformMatrix);
                    translate$1(tempEyeTransformMatrix, tempEyeTransformMatrix, worldXYZ);
                    targetTo(tempEyeTransformMatrix, worldXYZ, fromValues$1(mousePos[0], mousePos[1], 1), UP_VECTOR);
                    instanceMatrix.set(tempEyeTransformMatrix, n * 16);
                    instancePositions.set(worldXYZ, n * 3);
                    n++;
                }
            }
            device.queue.writeBuffer(instanceVertexUniformBuffer, 0, instanceMatrix);
            renderPass.setPipeline(pipeline);
            renderPass.setVertexBuffer(0, vertexBuffer);
            renderPass.setVertexBuffer(1, normalBuffer);
            renderPass.setIndexBuffer(indexBuffer, indices instanceof Uint16Array ? 'uint16' : 'uint32');
            renderPass.setBindGroup(0, uniformBindGroup);
            renderPass.drawIndexed(indices.length, NUM_INSTANCES);
            renderPass.endPass();
            device.queue.submit([commandEncoder.finish()]);
        }
    }))();

}());
