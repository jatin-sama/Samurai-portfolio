import struct, json, numpy as np, io, zlib, sys
from PIL import Image
f=open('/mnt/user-data/uploads/tripo_convert_74b37226-8277-454e-8672-12f06318ee7f.glb','rb').read()
cl,ct=struct.unpack('<II',f[12:20]); j=json.loads(f[20:20+cl])
bl,bt=struct.unpack('<II',f[20+cl:28+cl]); bin_=f[28+cl:28+cl+bl]
def acc(i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]
    off=bv.get('byteOffset',0)+a.get('byteOffset',0)
    nc={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']]
    dt={5126:np.float32,5125:np.uint32,5123:np.uint16}[a['componentType']]
    return np.frombuffer(bin_,dtype=dt,count=a['count']*nc,offset=off).reshape(-1,nc) if nc>1 else np.frombuffer(bin_,dtype=dt,count=a['count'],offset=off)
p=j['meshes'][0]['primitives'][0]
pos=acc(p['attributes']['POSITION']).astype(np.float64); uv=acc(p['attributes']['TEXCOORD_0']).astype(np.float64); idx=acc(p['indices']).reshape(-1,3).astype(np.int64)
print(pos.shape,uv.shape,idx.shape, uv.min(0),uv.max(0))
img=j['images'][0]; bv=j['bufferViews'][img['bufferView']]
jpg=bin_[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']]
open('castle_tex_orig.jpg','wb').write(jpg)
im=Image.open(io.BytesIO(jpg)); print(im.size,im.mode)
np.save('pos.npy',pos);np.save('uv.npy',uv);np.save('idx.npy',idx)
