const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});let errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.APP_URL||'http://127.0.0.1:5173',{waitUntil:'networkidle'});
 await page.getByRole('heading',{name:'Inside the Implementation',exact:true}).waitFor();
 if((await page.locator('body').innerText()).toLowerCase().includes('floryan'))throw Error('Unexpected unrelated attribution in UI');
 for(const name of ['buildNFA','acceptsString','epsilonTransition','star','union','concatenate']){
  await page.getByRole('button',{name:name+'()',exact:true}).click();
  if(!await page.locator('.java-line').count())throw Error('No source '+name);
  const annotations=page.locator('.annotation-list button');
  for(let i=0;i<await annotations.count();i++){await annotations.nth(i).click();if(!await page.locator('.java-line.selected').count())throw Error('No highlighted code');}
 }
 await page.getByRole('button',{name:'A near miss'}).click();
 await page.getByRole('button',{name:'Next Step',exact:true}).click();await page.getByRole('button',{name:'Next Step',exact:true}).click();
 if(await page.getByRole('status').textContent()==='Accepted')throw Error('Early acceptance');
 await page.getByRole('button',{name:'Next Step',exact:true}).click();
 if(await page.getByRole('status').textContent()!=='Rejected')throw Error('Missing rejection');
 await page.getByRole('button',{name:'Previous Step',exact:true}).click();
 await page.getByRole('button',{name:'Reset simulation'}).click();
 await page.getByRole('button',{name:'Repeating pairs'}).click();
 await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(150);await page.getByRole('button',{name:'Pause',exact:true}).click();
 const before=await page.locator('.tape small').textContent();await page.waitForTimeout(800);if(before!==await page.locator('.tape small').textContent())throw Error('Pause failed');
 await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(3000);
 if(await page.getByRole('status').textContent()!=='Accepted')throw Error('Play failed');
 await page.getByText('Inspect execution trace · 5 snapshots',{exact:true}).click();
 if(await page.locator('tbody tr').count()!==5)throw Error('Trace rows');
 await page.getByRole('button',{name:'Go to step 1',exact:true}).click();
 const graphCheck=await page.evaluate(async()=>{
   const {compile,trace}=await import('/src/engine.ts');
   const machine=compile('(ad)*'),frame=trace(machine,'a1b2')[1];
   const svg=document.querySelector('.lab > .graph-scroll svg');
   const states=[...svg.querySelectorAll('.state')],edges=[...svg.querySelectorAll('.edge')];
   return states.length===machine.states.length&&edges.length===machine.edges.length&&states.filter(s=>s.classList.contains('active')).length===frame.active.length&&machine.edges.every((e,i)=>edges[i].getAttribute('aria-label')===`Transition q${e.from} ${e.symbol} q${e.to}`)&&machine.states.every((q,i)=>states[i].classList.contains('active')===frame.active.includes(q));
  });
 if(!graphCheck)throw Error('Graph does not correspond to actual machine');
 await page.getByRole('button',{name:'Construction',exact:true}).click();
 await page.getByRole('button',{name:'Next →',exact:true}).click();
 // Changing to a shorter expression while a later construction snapshot is selected must stay valid.
 await page.getByRole('button',{name:'Next →',exact:true}).click();
 await page.locator('.lab-inputs input').first().fill('a');
 await page.getByRole('button',{name:'Execution',exact:true}).waitFor();
 await page.getByRole('button',{name:'Execution',exact:true}).click();
 await page.locator('.lab-inputs input').first().fill('((ad)*)*');await page.getByRole('alert').waitFor();
 await page.getByRole('button',{name:'Repeating pairs'}).click();
 await page.locator('.lab-inputs input').nth(1).fill('');
 if(await page.getByRole('status').textContent()!=='Accepted')throw Error('Empty input must be accepted by (ad)*');
 await page.getByRole('button',{name:'Repeating pairs'}).click();
 if(process.env.SCREENSHOT_DIR)await page.screenshot({path:process.env.SCREENSHOT_DIR+'/nfa-desktop.png',fullPage:true});
 for(const width of [390,768,1440]){
  await page.setViewportSize({width,height:900});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw Error('Page overflows at '+width);
 }
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'star()',exact:true}).click();await page.locator('#inside-implementation').scrollIntoViewIfNeeded();
 if(process.env.SCREENSHOT_DIR)await page.screenshot({path:process.env.SCREENSHOT_DIR+'/nfa-mobile.png',fullPage:true});
 if(errors.length)throw Error(errors.join('\n'));console.log('Browser checks passed: 6 methods, linked annotations, execution controls, no early acceptance, trace navigation, construction, invalid input, no overflow at 390/768/1440px.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
