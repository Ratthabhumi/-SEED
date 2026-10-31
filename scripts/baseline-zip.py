"""Standard-library baseline ZIP layout/CRC guard; no external downloads."""
import sys, zipfile, stat
from pathlib import Path, PurePosixPath

mode, source, target = sys.argv[1:]
if mode == 'pack':
    with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as z:
        for p in sorted(Path(source).rglob('*')):
            if p.is_symlink(): raise ValueError('Symlink in baseline')
            if p.is_file():
                info=zipfile.ZipInfo(p.relative_to(source).as_posix(), (1980,1,1,0,0,0))
                info.compress_type=zipfile.ZIP_DEFLATED
                z.writestr(info, p.read_bytes())
elif mode == 'unpack':
    root=Path(target).resolve()
    with zipfile.ZipFile(source) as z:
        names=set(); total=0
        if len(z.infolist()) > 512: raise ValueError('Too many baseline entries')
        for entry in z.infolist():
            name=entry.filename
            path=PurePosixPath(name)
            if '\\' in name or ':' in name or path.is_absolute() or '..' in path.parts:
                raise ValueError('Unsafe archive path')
            if name in names: raise ValueError('Duplicate ZIP path')
            names.add(name); total+=entry.file_size
            if total > 200_000_000: raise ValueError('Baseline expanded size limit')
            if stat.S_ISLNK(entry.external_attr >> 16): raise ValueError('Archive symlink')
            dest=root.joinpath(*path.parts).resolve()
            if not dest.is_relative_to(root): raise ValueError('Archive escaped destination')
        if 'index.html' not in names: raise ValueError('Missing root index.html')
        for entry in z.infolist():
            dest=root.joinpath(*PurePosixPath(entry.filename).parts)
            if entry.is_dir(): dest.mkdir(parents=True,exist_ok=True)
            else:
                dest.parent.mkdir(parents=True,exist_ok=True)
                dest.write_bytes(z.read(entry)) # validates CRC before use
else: raise ValueError('Unknown ZIP operation')
