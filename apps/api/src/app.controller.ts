import { Controller, Get, Res } from '@nestjs/common';
import express from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(@Res() res: express.Response) {
    const info = this.appService.getSystemInfo();

    res.send(`
<!DOCTYPE html>
<html>
<head>
<title>${info.app}</title>

<style>

body{
  margin:0;
  height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#0b0f19;
  font-family:system-ui,-apple-system,Segoe UI,Roboto;
  color:#e6edf3;
}

.card{
  background:#111827;
  border:1px solid #1f2937;
  border-radius:16px;
  padding:42px;
  width:440px;
  box-shadow:0 30px 80px rgba(0,0,0,0.6);
}

.title{
  font-size:26px;
  font-weight:600;
  margin-bottom:6px;
  color:#60a5fa;
}

.status{
  color:#22c55e;
  font-size:14px;
  margin-bottom:26px;
}

.row{
  display:flex;
  justify-content:space-between;
  padding:8px 0;
  font-size:14px;
  border-bottom:1px solid #1f2937;
}

.row:last-child{
  border-bottom:none;
}

.footer{
  margin-top:28px;
  font-size:13px;
  text-align:center;
  color:#9ca3af;
}

.footer a{
  color:#60a5fa;
  text-decoration:none;
}

.footer a:hover{
  text-decoration:underline;
}

</style>
</head>

<body>

<div class="card">

<div class="title">⚡ ${info.app}</div>
<div class="status">● ${info.status}</div>

<div class="row">
<span>Uptime</span>
<span>${info.uptime}s</span>
</div>

<div class="row">
<span>Framework</span>
<span>${info.framework}</span>
</div>

<div class="footer">
Built by <a href="${info.developerUrl}" target="_blank">${info.developer}</a> · ${info.year}
</div>

</div>

</body>
</html>
`);
  }
}
