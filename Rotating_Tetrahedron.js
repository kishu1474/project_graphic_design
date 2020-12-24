
var Vertex_shader_source = 

'attribute  vec3 vertex_position;\n' +
'attribute  vec3 vertex_color;\n' +
'varying vec4 color;\n' +
'uniform vec3 theta;\n' +

'void main() {\n' +
  
    'vec3 angle = radians( theta );\n' +
    'vec3 c = cos( angle );\n' +
    'vec3 s = sin( angle );\n' +

    'mat4 rx = mat4( 1.0,  0.0,  0.0,  0.0,\n' +
                    '0.0,  c.x,  s.x,  0.0,\n' +
                    '0.0, -s.x,  c.x,  0.0,\n' +
                    '0.0,  0.0,  0.0,  1.0 );\n' +

    'mat4 ry = mat4( c.y,  0.0, -s.y,  0.0,\n' +
                    '0.0,  1.0,  0.0,  0.0,\n' +
                    's.y,  0.0,  c.y,  0.0,\n' +
                    '0.0,  0.0,  0.0,  1.0 );\n' +


    'mat4 rz = mat4( c.z, -s.z, 0.0, 0.0,\n' +
                    's.z,  c.z, 0.0, 0.0,\n' +
                    '0.0,  0.0, 1.0, 0.0,\n' +
                    '0.0,  0.0, 0.0, 1.0 );\n' +
    
    'gl_Position = rz * ry * rx * vec4 (vertex_position, 1.0);\n' +
    'color = vec4(vertex_color,1.0);\n' +

'}\n'; 

var fragment_shader_source = 

'precision mediump float;\n' +  
'varying vec4 color;\n' +

'void main() {\n' +
    'gl_FragColor = color;\n' +
'}\n';

var points = [];
var colors = [];
var axis = 0;
var x_axis = 0;
var y_axis = 1;
var z_axis = 2;
var theta = [ 0, 0, 0 ];
var levels = 2;
var theta_Location; 

var vertices = [
    vec3(  0.0000,  0.0000, -1.0000 ),
    vec3(  0.0000,  0.9428,  0.3333 ),
    vec3( -0.8165, -0.4714,  0.3333 ),
    vec3(  0.8165, -0.4714,  0.3333 )
];

var base_colors = [
    vec3(1.0, 0.0, 0.0), 
    vec3(0.0, 1.0, 0.0), 
    vec3(0.0, 0.0, 1.0), 
    vec3(0.0, 0.0, 0.0) 
];

function main()
{
    var canvas = document.getElementById('canvas');

    var gl = canvas.getContext('webgl')

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);;

    let vertex_shader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertex_shader, Vertex_shader_source)
    gl.compileShader(vertex_shader)

    let fragment_shader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragment_shader, fragment_shader_source)
    gl.compileShader(fragment_shader)

    let program = gl.createProgram()
    gl.attachShader(program, vertex_shader)
    gl.attachShader(program, fragment_shader)
    gl.linkProgram(program)

    gl.clearColor(0.0, 0.0, 0.0, 0.0)

    gl.useProgram(program)
    
    divideTetrahedron( vertices[0], vertices[1], vertices[2], vertices[3], levels);

    var color_buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, color_buffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vertex_color = gl.getAttribLocation( program, "vertex_color" );
    gl.vertexAttribPointer( vertex_color, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertex_color );
    
    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vertex_buffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vertex_position = gl.getAttribLocation( program, "vertex_position" );
    gl.vertexAttribPointer( vertex_position, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertex_position );

    theta_location = gl.getUniformLocation(program, "theta"); 
    
    document.getElementById( "x_button" ).onclick = function () {
        axis = x_axis;
    };
    document.getElementById( "y_button" ).onclick = function () {
        axis = y_axis;
    };
    document.getElementById( "z_button" ).onclick = function () {
        axis = z_axis;
    };

    function render()
    {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        theta[axis] += 0.5;
        console.log(theta);
        gl.uniform3fv(theta_location, theta);
        gl.drawArrays(gl.TRIANGLES, 0, points.length);
        requestAnimFrame( render );
    }

    render();
};

function triangle( a, b, c, color )
{
    colors.push( base_colors[color] );
    points.push( a );
    colors.push( base_colors[color] );
    points.push( b );
    colors.push( base_colors[color] );
    points.push( c );
}

function tetrahedron( a, b, c, d )
{  
    triangle( a, c, b, 0 );
    triangle( a, c, d, 1 );
    triangle( a, b, d, 2 );
    triangle( b, c, d, 3 );
}

function divideTetrahedron( a, b, c, d, count )
{
    if ( count === 0 ) {
        tetrahedron( a, b, c, d );
    }  
    else {	
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var ad = mix( a, d, 0.5 );
        var bc = mix( b, c, 0.5 );
        var bd = mix( b, d, 0.5 );
        var cd = mix( c, d, 0.5 );

        --count;
        
        divideTetrahedron( a, ab, ac, ad, count );
        divideTetrahedron( ab, b, bc, bd, count );
        divideTetrahedron( ac, bc, c, cd, count );
        divideTetrahedron( ad, bd, cd, d, count );
    }
}

