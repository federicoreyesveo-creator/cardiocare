LOGO='<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 34.5S5 25.6 5 15.4C5 10.6 8.7 7 13.2 7c2.8 0 5.2 1.4 6.8 3.6C21.6 8.4 24 7 26.8 7 31.3 7 35 10.6 35 15.4 35 25.6 20 34.5 20 34.5Z" fill="#E11D2E"/><path d="M8.5 19.5h7l2-4 3.2 8 2.3-5h8.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
PHONE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>'
HEART='<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21Z"/></svg>'
hdr=open('e-header.html').read().replace('__LOGO__',LOGO).replace('__PHONE__',PHONE).replace('__HEART__',HEART)
head='''<title>Cardiólogo Pediatra en Mérida · Cardio Care</title>
<meta name="description" content="Dr. Josué Cauich Segovia, cardiólogo pediatra intervencionista en Mérida, Yucatán.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600&family=Geist+Mono:wght@500&display=swap" rel="stylesheet">
'''
out=head+open('e.css').read()+'\n'+hdr+'\n'+open('e-img.html').read()+open('e-data.js').read()+'\nconst LOGO=`'+LOGO+'`;\n'+open('e-views.js').read()+'\n})();\n</script>\n'
open('cardio.html','w').write(out)
open('index.html','w').write('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+out.replace('</style>\n','</style>\n</head>\n<body>\n',1)+'</body>\n</html>\n')
print(len(out)//1024,'KB')
