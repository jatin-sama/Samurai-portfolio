import numpy as np, sys
pos=np.load('pos.npy');uv=np.load('uv.npy');idx=np.load('idx.npy')
def run(cell,uvq=40):
    mn=pos.min(0)
    pc=np.floor((pos-mn)/cell).astype(np.int64)
    dims=pc.max(0)+1
    pkey=(pc[:,0]*dims[1]+pc[:,1])*dims[2]+pc[:,2]
    up=np.floor(uv*uvq).astype(np.int64)
    ckey=pkey*(uvq*uvq+7)+up[:,0]*uvq+up[:,1]
    # position per position cell (shared)
    up_k,pinv=np.unique(pkey,return_inverse=True)
    cnt=np.bincount(pinv).astype(np.float64)
    ppos=np.stack([np.bincount(pinv,pos[:,k])/cnt for k in range(3)],1)
    uk,cinv=np.unique(ckey,return_inverse=True)
    ccnt=np.bincount(cinv).astype(np.float64)
    cuv=np.stack([np.bincount(cinv,uv[:,k])/ccnt for k in range(2)],1)
    # each cluster -> its pos cell
    c2p=np.zeros(len(uk),dtype=np.int64); c2p[cinv]=pinv
    tri=cinv[idx]
    pt=c2p[tri]
    keep=(pt[:,0]!=pt[:,1])&(pt[:,1]!=pt[:,2])&(pt[:,0]!=pt[:,2])
    tri=tri[keep]
    # drop duplicate tris
    s=np.sort(tri,1); _,u=np.unique(s,axis=0,return_index=True); tri=tri[np.sort(u)]
    used=np.unique(tri); remap=-np.ones(len(uk),dtype=np.int64); remap[used]=np.arange(len(used))
    tri=remap[tri]; vpos=ppos[c2p[used]]; vuv=cuv[used]
    return vpos,vuv,tri
if __name__=='__main__':
    for c in [0.006,0.005,0.004,0.0035,0.003]:
        v,u,t=run(c); print(c,len(v),len(t))
