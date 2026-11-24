import numpy as np, zlib, base64, struct, io
from PIL import Image
v=np.load('sv.npy');u=np.load('su.npy');t=np.load('st.npy')
# spatial sort of vertices for better delta coding
order=np.lexsort((np.round(v[:,0]*40),np.round(v[:,2]*40),np.round(v[:,1]*40)))
inv=np.empty_like(order);inv[order]=np.arange(len(order))
v=v[order];u=u[order];t=inv[t]
# order tris by min index
t=t[np.argsort(t.min(1),kind='stable')]
nv,nt=len(v),len(t)
mn=v.min(0);mx=v.max(0)
q=[np.round((v[:,k]-mn[k])/(mx[k]-mn[k])*65535).astype(np.int64) for k in range(3)]
q+= [np.round(np.clip(u[:,k],0,1)*65535).astype(np.int64) for k in range(2)]
body=b''
for a in q:
    d=np.diff(np.concatenate([[0],a]))&65535
    body+=(d&255).astype(np.uint8).tobytes()+((d>>8)&255).astype(np.uint8).tobytes()
a0=t[:,0];d0=np.diff(np.concatenate([[0],a0])).astype(np.int64);d1=(t[:,1]-a0);d2=(t[:,2]-a0)
for d in (d0,d1,d2):
    d=d.astype(np.int64)&0xffffffff
    for sh in (0,8,16,24): body+=((d>>sh)&255).astype(np.uint8).tobytes()
comp=zlib.compress(body,9)
hdr=struct.pack('<II',nv,nt)+struct.pack('<3f',*mn)+struct.pack('<3f',*mx)
assert len(hdr)==32
b64=base64.b64encode(hdr+comp).decode()
open('castle.b64','w').write(b64)
print('verts',nv,'tris',nt,'b64 bytes',len(b64),'bounds',mn,mx)
# texture
im=Image.open('castle_tex_orig.jpg').convert('RGB')
bio=io.BytesIO();im.save(bio,'JPEG',quality=72,optimize=True,progressive=False)
open('castle-tex.b64','w').write(base64.b64encode(bio.getvalue()).decode());print('tex',len(bio.getvalue()))
# verify decode
raw=zlib.decompress(comp);off=0;ch=[]
for c in range(5):
    lo=np.frombuffer(raw,np.uint8,nv,off);hi=np.frombuffer(raw,np.uint8,nv,off+nv);off+=2*nv
    ch.append(np.cumsum(lo.astype(np.int64)|(hi.astype(np.int64)<<8))&65535)
pos=np.stack([mn[k]+ch[k]/65535*(mx[k]-mn[k]) for k in range(3)],1)
print('pos err',np.abs(pos-v).max())
dd=[]
for c in range(3):
    pl=[np.frombuffer(raw,np.uint8,nt,off+i*nt).astype(np.int64) for i in range(4)];off+=4*nt
    x=pl[0]|(pl[1]<<8)|(pl[2]<<16)|(pl[3]<<24); x=np.where(x>=2**31,x-2**32,x); dd.append(x)
A=np.cumsum(dd[0]);tri=np.stack([A,A+dd[1],A+dd[2]],1);print('tri ok',(tri==t).all())
