import bpy, math, os, random
from mathutils import Vector

OUT = r"C:\Users\lamam\classroom-notes"
FRAME_DIR = os.path.join(OUT, "assets", "classroom", "frames")
TMP_DIR = os.path.join(OUT, "assets", "classroom", "_png")
os.makedirs(FRAME_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

# clear scene
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for block in bpy.data.materials:
    bpy.data.materials.remove(block)

scene = bpy.context.scene
try:
    scene.render.engine = "BLENDER_EEVEE_NEXT"
except TypeError:
    scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.film_transparent = False
scene.render.image_settings.file_format = "PNG"
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 48
try:
    scene.eevee.taa_render_samples = 32
except Exception:
    pass

# materials
def mat(name, color, rough=0.8):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1.0)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (*color, 1.0)
        bsdf.inputs["Roughness"].default_value = rough
    return m

beige = mat("beige", (0.66, 0.58, 0.42))
beige2 = mat("beige2", (0.60, 0.53, 0.39))
floor_mat = mat("floor", (0.32, 0.32, 0.34), 0.9)
wood = mat("wood", (0.26, 0.14, 0.07), 0.6)
wood_dark = mat("wood_dark", (0.17, 0.10, 0.05), 0.7)
green = mat("green", (0.04, 0.26, 0.12), 0.85)
metal = mat("metal", (0.18, 0.19, 0.21), 0.5)
glass = mat("glass", (0.45, 0.55, 0.62), 0.25)
white = mat("white", (0.9, 0.9, 0.86))
red = mat("red", (0.55, 0.10, 0.10))
skin = [mat("skin1",(0.72,0.52,0.38)), mat("skin2",(0.55,0.36,0.25)), mat("skin3",(0.85,0.66,0.5))]
shirt = [mat("shirt1",(0.20,0.35,0.55)), mat("shirt2",(0.60,0.30,0.20)), mat("shirt3",(0.30,0.45,0.30)), mat("shirt4",(0.50,0.45,0.60))]

def box(name, loc, dim, material, rot=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.dimensions = dim
    if rot:
        o.rotation_euler[2] = rot
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    return o

def cyl(name, loc, radius, depth, material):
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=radius, depth=depth, location=loc)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(material)
    return o

def sphere(name, loc, radius, material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=radius, location=loc)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(material)
    return o

# floor and ceiling
box("floor", (0,0,-0.05), (8.4,7.4,0.1), floor_mat)
box("ceiling", (0,0,3.25), (8.4,7.4,0.1), beige2)

# walls
# south (behind camera)
box("wall_south", (0,-3.55,1.6), (8.2,0.15,3.3), beige)
# west
box("wall_west", (-4.05,0,1.6), (0.15,7.2,3.3), beige)
# east (chalkboard wall)
box("wall_east", (4.05,0,1.6), (0.15,7.2,3.3), beige)
# north wall: left segment, door gap (x 2.5..3.5), right segment
box("wall_north_left", (-0.75,3.55,1.6), (6.6,0.15,3.3), beige)
box("wall_north_right", (3.78,3.55,1.6), (0.54,0.15,3.3), beige)
box("wall_north_top", (3.0,3.55,2.95), (1.0,0.15,0.7), beige)

# ceiling beams
for x in [-2.6, 0.2, 3.0]:
    box("beam_%s" % x, (x,0,3.12), (0.35,7.2,0.25), beige2)

# chalkboard on east wall
box("board_frame", (3.94,0.4,1.75), (0.12,4.2,1.6), wood_dark)
box("board", (3.86,0.4,1.75), (0.06,4.0,1.45), green)
# chalk tray
box("tray", (3.78,0.4,1.0), (0.2,4.0,0.06), wood)

# windows on north wall (left segment)
for i, wx in enumerate([-3.0, -1.5, 0.0, 1.5]):
    box("win_frame_%d" % i, (wx,3.44,1.9), (1.3,0.1,1.9), metal)
    box("win_glass_%d" % i, (wx,3.40,1.9), (1.18,0.05,1.78), glass)
    # horizontal blinds
    for j in range(8):
        box("blind_%d_%d" % (i,j), (wx,3.36,1.15+j*0.22), (1.16,0.04,0.09), white)

# projector screen near chalkboard top
box("screen", (3.80,0.4,2.72), (0.08,3.6,0.5), white)

# projector hanging
box("projector", (-1.2,0.8,2.75), (0.45,0.35,0.2), white)
cyl("proj_rod", (-1.2,0.8,3.0), 0.02, 0.5, metal)

# ceiling fans
for fx,fy in [(-2.2,0.2),(1.8,0.2)]:
    cyl("fan_hub_%s" % fx, (fx,fy,2.95), 0.12, 0.12, metal)
    for a in range(4):
        ang = a*math.pi/2
        bx = fx + 0.5*math.cos(ang)
        by = fy + 0.5*math.sin(ang)
        blade = box("blade_%s_%d" % (fx,a), (bx,by,2.95), (0.9,0.12,0.03), wood)
        blade.rotation_euler[2] = ang

# desks and benches
desk_x = [-2.6, -0.9, 0.8, 2.5]
desk_y = [-2.2, -0.5, 1.2]
student_positions = []
for ri, dy in enumerate(desk_y):
    for ci, dx in enumerate(desk_x):
        box("desk_%d_%d" % (ri,ci), (dx,dy,0.78), (1.35,0.65,0.06), wood)
        for lx in [-0.55,0.55]:
            for ly in [-0.25,0.25]:
                box("leg", (dx+lx,dy+ly,0.39), (0.05,0.05,0.78), metal)
        # bench behind desk (toward +y)
        box("bench_%d_%d" % (ri,ci), (dx,dy+0.62,0.45), (1.3,0.32,0.05), wood_dark)
        for lx in [-0.5,0.5]:
            box("benchleg", (dx+lx,dy+0.62,0.22), (0.04,0.04,0.44), metal)
        # student on some desks
        if ri > 0 and (ri+ci) % 3 != 2:
            student_positions.append((dx, dy+0.55, ri, ci))

# five subject books scattered on desks
book_colors = [
    (0.31, 0.55, 1.00),  # blue
    (1.00, 0.42, 0.42),  # red
    (0.32, 0.80, 0.40),  # green
    (0.99, 0.77, 0.15),  # yellow
    (0.80, 0.36, 0.91),  # purple
]
desks = [(dx, dy) for dy in [-0.5, 1.2] for dx in [-0.9, 0.8, 2.5]]
random.seed(11)
chosen = random.sample(desks, 5)
for i, (bx, by) in enumerate(chosen):
    cover = mat("bookcover_%d" % i, book_colors[i], 0.55)
    box("book_pages_%d" % i, (bx, by, 0.84), (0.42, 0.30, 0.05), white)
    box("book_cover_%d" % i, (bx, by, 0.875), (0.45, 0.33, 0.02), cover)
    box("book_spine_%d" % i, (bx - 0.22, by, 0.86), (0.03, 0.33, 0.07), cover)
    box("book_label_%d" % i, (bx + 0.06, by, 0.888), (0.18, 0.06, 0.004), white)
print("books on desks:", chosen)

# door frame (north wall gap)
box("door_frame_l", (2.48,3.5,1.1), (0.08,0.2,2.2), wood_dark)
box("door_frame_r", (3.52,3.5,1.1), (0.08,0.2,2.2), wood_dark)
box("door_frame_top", (3.0,3.5,2.2), (1.12,0.2,0.08), wood_dark)

# lighting
world = bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
bg.inputs["Color"].default_value = (0.72,0.76,0.82,1)
bg.inputs["Strength"].default_value = 0.35

sun_data = bpy.data.lights.new("sun", "SUN")
sun = bpy.data.objects.new("sun", sun_data)
scene.collection.objects.link(sun)
sun.rotation_euler = (math.radians(35), math.radians(-25), math.radians(20))
sun_data.energy = 1.4
sun_data.color = (1.0, 0.95, 0.85)

for lx,ly in [(-2,1),(2,-1)]:
    ld = bpy.data.lights.new("area", "AREA")
    lo = bpy.data.objects.new("area", ld)
    scene.collection.objects.link(lo)
    lo.location = (lx,ly,3.0)
    ld.energy = 180
    ld.shape = "RECTANGLE"
    ld.size = 3
    ld.size_y = 2

# camera
cam_data = bpy.data.cameras.new("cam")
cam = bpy.data.objects.new("cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
cam_data.lens = 28

def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()

keys = [
    (1,  (3.0, 4.8, 1.65), (2.8, 1.5, 1.5)),
    (14, (3.0, 3.3, 1.65), (1.8, 0.8, 1.5)),
    (28, (1.4, 1.4, 1.65), (-1.0, 2.5, 1.5)),
    (48, (-2.6, -2.6, 1.70), (3.0, 2.6, 1.50)),
]
for frame, loc, target in keys:
    cam.location = loc
    look_at(cam, target)
    cam.keyframe_insert(data_path="location", frame=frame)
    cam.keyframe_insert(data_path="rotation_euler", frame=frame)


# render frames
for f in range(1, 49):
    scene.frame_set(f)
    scene.render.filepath = os.path.join(TMP_DIR, "frame_%03d.png" % (f-1))
    bpy.ops.render.render(write_still=True)
    print("rendered", f)

print("DONE")