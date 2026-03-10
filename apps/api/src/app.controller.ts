import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(@Res() res: Response) {
    const info = this.appService.getSystemInfo();

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
    <title>${info.app}</title>
    
    <style>
    
    *{
    box-sizing:border-box;
    }
    
    body{
    margin:0;
    height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    background:radial-gradient(circle at 20% 20%, #111827, #020617);
    font-family:system-ui,-apple-system,Segoe UI,Roboto;
    color:#e6edf3;
    overflow:hidden;
    }
    
    .card{
    background:rgba(17,24,39,0.85);
    border:1px solid rgba(255,255,255,0.06);
    border-radius:18px;
    padding:44px;
    width:460px;
    backdrop-filter:blur(14px);
    box-shadow:0 30px 80px rgba(0,0,0,0.7);
    animation:cardEnter .6s ease;
    }
    
    @keyframes cardEnter{
    from{
    opacity:0;
    transform:translateY(20px) scale(.98);
    }
    to{
    opacity:1;
    transform:translateY(0) scale(1);
    }
    }
    
    .title{
    font-size:28px;
    font-weight:600;
    margin-bottom:8px;
    background:linear-gradient(90deg,#60a5fa,#22d3ee);
    -webkit-background-clip:text;
    color:transparent;
    }
    
    .status{
    display:flex;
    align-items:center;
    gap:8px;
    color:#22c55e;
    font-size:14px;
    margin-bottom:26px;
    }
    
    .dot{
    width:10px;
    height:10px;
    background:#22c55e;
    border-radius:50%;
    box-shadow:0 0 12px #22c55e;
    animation:pulse 2s infinite;
    }
    
    @keyframes pulse{
    0%{opacity:.5; transform:scale(.9);}
    50%{opacity:1; transform:scale(1);}
    100%{opacity:.5; transform:scale(.9);}
    }
    
    .row{
    display:flex;
    justify-content:space-between;
    padding:10px 0;
    font-size:14px;
    border-bottom:1px solid rgba(255,255,255,0.06);
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
    
    <div class="status">
    <div class="dot"></div>
    <span>${info.status}</span>
    </div>
    
    <div class="row">
    <span>Uptime</span>
    <span>${info.uptime}s</span>
    </div>
    
    <div class="row">
    <span>Framework</span>
    <span>${info.framework}</span>
    </div>
    
    <div class="row">
    <span>Environment</span>
    <span>Production</span>
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
