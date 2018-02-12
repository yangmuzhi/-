HTMLWidgets.widget({
  name: 'corrplot',
  type: 'output',

  initialize: function(el, width, height) {

    console.log("init")
  //定义div元素
	 var wrapDiv = d3.select(el)
		.append("div")
		.attr("id", "content-wrapper")
		//.attr("width", "10px")//这里可不可以修改
//定义按钮
	var buttonHTML = '<div id="bottonBox" class="row" style="margin-top:-200px; width:900px"> <div class="col-md-2">' +
  '<div id = "svgSizeSlider"></div> <input type="submit" id="svgSizeSub"/>'+
  '<p class="buttonLabel"> Order:</p>'+
  '<div><p>Sig: </p><button id="sigshow" value="sigshow">sigshow</button></div>'+
		'<select id="orderSelect" style="width:80px"> <option value="original">original</option> <option value="AOE">AOE</option><option value="FPC">FPC</option>			<option value="hclust">hclust</option>			<option value="name">name</option>		</select>		</div>'+
		'<div class="col-md-4" >	<p class="buttonLabel"> DiagShow:</p>		<div id="diagDiv" class="btn-group" data-toggle="buttons">			<label class="btn btn-info">				<input type="radio" name="options" id="Upper" autocomplete="off"  value="Upper" > Upper			</label>			<label class="btn btn-info">				<input type="radio" name="options" id="Lower" autocomplete="off" value="Lower"> Lower			</label>			<label class="btn btn-info active">				<input type="radio" name="options" id="Full" autocomplete="off" value="Full" checked> Full			</label>		</div></div>'+
		'<div class="col-md-4" >		<p class="buttonLabel"> Legend:</p>			<div id="legendDiv" class="btn-group" data-toggle="buttons" style="position: relative">				<label class="btn btn-info active">					<input type="radio" name="legend" autocomplete="off" checked id="circle" value="Circle"> Circle				</label>				<label class="btn btn-info">					<input type="radio" name="legend" autocomplete="off" id="square"  value="Square"> Square				</label>				<label class="btn btn-info">					<input type="radio" name="legend" autocomplete="off" id="ellipse" value="Ellipse"> Ellipse				</label>			</div>	</div>'+
		'<div class="col-md-2" >		 <p class="buttonLabel"> Number: </p>		<button type="button" id="numShow" class="btn btn-outline-info" value="show">Show</button>	</div></div>'+
		'<br/><br/><br/>'
//在div元素中添加按钮
	var bottonDiv = d3.select(el)
		.append("div")
		.html(buttonHTML)
  //  console.log(buttonHTML)
    return wrapDiv;
  },
/*               */
//el: the elements host the widget
//x:包括data和settings
//rendervaule：代码压缩
  renderValue: function(el, x, wrapDiv) {
	 wrapDiv.selectAll("div").remove();
	 wrapDiv.selectAll("svg").remove();

	 plotDiv = wrapDiv.append("div")
		.attr("class", "corrplot")
		.attr("id", "corrplot-1")

	var svgHTML = '	<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><defs><linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#053061;stop-opacity:1" /><stop offset="50%" style="stop-color:#FFFFFF;stop-opacity:1" /><stop offset="100%" style="stop-color:#67001F;stop-opacity:1" /></linearGradient></defs></svg>'
//添加svg
	wrapDiv.append("svg")
		.html(svgHTML)
//添加svg元素
w = x['size'][0]
h = x["size"][1]

//console.log($("#svgSizeSlider").value)
//$("#svgSizeSlider").value

mvisCorrplotData = x['data']


var  n = mvisCorrplotData["matrixLength"];
/*定义比例尺   2018-2-7*/
//这里可以这样设想，可以设置一些滑轮选项来调整 svg的大小，内部元素的一些细节大小。
//比例主要调节的是文字 坐标和label的大小。cell rect不需要。


//var svgScale = d3.scale.linear().domain([]).range([]);

/**/



//console.log(x.size)
	 svg = plotDiv.append("svg")
      .attr("width", w)//这里可以修改
      .attr("height", h)//
	  .attr("id", "plotSVG");
	//console.log(svg.attr("id"))
	//console.log(el)
	//console.log(x)

    //instance.setOption(x, true);
	//instance.setTheme(eval(x.theme + "Theme"));

  /*
  outList <- list(
				matrixLength = ncol(corr),
				color = color,
				colNames = colNames,
				matrixData = corr,
				orderList = orderList
		)
    x <- list(
  data = outList,
  settings = settings
)
  */
  //这个data中应该是从R的函数中获取的；
//以0.1作为空白比例
    lineStart = 0.1*w;
		lineEnd = 0.85*w;
		cellSize = (lineEnd - lineStart)/n;//cell的个数
		hLineArray = new Array(n+1);//水平线
		vLineArray = new Array(n+1);//垂直线
		maxR = 0.9 * cellSize;//应该是定义圈的最大最小值
		minR = 0.1 * cellSize;
		numShow = false;
		method = mvisCorrplotData["method"]
		diagShow = "diagFull";
		nofFill = 0;
		maxValue = 1;
		middleValue = 0;
		minValue = -1;
numLabelSize = 0.01*w

		maxCol = mvisCorrplotData["color"][0];
		middleCol = mvisCorrplotData["color"][1];
		minCol = mvisCorrplotData["color"][2];
		newSeq = mvisCorrplotData["orderList"]["original"]
    colNames = mvisCorrplotData["colNames"]
//CI
pMat = x["CI"]["p"];

SigArray = new Array();
for(var i=0;i<pMat.length;i++){
for(var j=0;j<pMat.length;j++){

if(pMat[i][j]>0.05){
  SigArray[i*n+j]=0; }else {
  SigArray[i*n+j]=1;
  };

}}


    nowSeq = new Array() ;

//从html中选取
//使用iquery ui
		$( "#legendDiv" ).buttonset();
		$( "#diagDiv" ).buttonset();
		$( "#numShow" ).button();

		$("bottonBox").css("margin-left")
// 颜色进制转换  使用prototype给string添加方法
		var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;//正则表达式
		String.prototype.colorHex = function(){
			var that = this;
			if(/^(rgb|RGB)/.test(that)){//test 是什么
				var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g,"").split(",");
				var strHex = "#";
				for(var i=0; i<aColor.length; i++){
					var hex = Number(aColor[i]).toString(16);
					if(hex === "0"){
						hex += hex;
					}
					strHex += hex;
				}
				if(strHex.length !== 7){
					strHex = that;
				}
				return strHex;
			}else if(reg.test(that)){
				var aNum = that.replace(/#/,"").split("");
				if(aNum.length === 6){
					return that;
				}else if(aNum.length === 3){
					var numHex = "#";
					for(var i=0; i<aNum.length; i+=1){
						numHex += (aNum[i]+aNum[i]);
					}
					return numHex;
				}
			}else{
				return that;
			}
		};
/*//*/
		String.prototype.colorRgb = function(){
			var sColor = this.toLowerCase();
			if(sColor && reg.test(sColor)){
				if(sColor.length === 4){
					var sColorNew = "#";
					for(var i=1; i<4; i+=1){
						sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));
					}
					sColor = sColorNew;
				}
				var sColorChange = [];
				for(var i=1; i<7; i+=2){
					sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));
				}
				return sColorChange;
			}else{
				return sColor;
			}
		};
//计算大量数据

		var parse_mvisCorrplotData = function(a){//该函数计算矩阵可视化每个cell的属性值
			if (a.length==1){//只有一个cell时
				outArray = new Array(1)
				percent = (a[0] - middleValue)/(maxValue - middleValue);
				r = (percent*(maxR-minR)+minR)/2;
				cx = cellSize*(0.5) + lineStart;//
				cy = cellSize*(0.5) + lineStart;//
				color = colorSelector(a[0])//
				outArray[0] = new Array(r, cx, cy, color, a[0], cellSize*0+lineStart, cellSize*0+lineStart )
				return outArray
			}else{
				outArray = new Array(n*n)//大于1个时
        //矩阵，开始遍历。    可尝试使用矩阵的形式来表达
				for(var i = 0; i < n; i++){
					for(var j=0; j < n; j++){
						if (a[i][j] > middleValue) percent = (a[i][j] - middleValue)/(maxValue - middleValue);
						else percent = (middleValue - a[i][j])/(middleValue - minValue);
						r = (percent*(maxR-minR)+minR)/2;
						cx = cellSize*(j+0.5) + lineStart;
						cy = cellSize*(i+0.5) + lineStart;
						color = colorSelector(a[i][j])
            //                          cell的半径，cell位置，颜色，原始数据，行位置，列位置
						outArray[i*n+j] = new Array(r, cx, cy, color, a[i][j], cellSize*j+lineStart, cellSize*i+lineStart,//这里改了
           [cellSize*j+lineStart+pchSider,cellSize*(j+1)+lineStart-pchSider,cellSize*i+lineStart+pchSider,cellSize*(i+1)+lineStart-pchSider],
           [cellSize*(j+1)+lineStart-pchSider,cellSize*j+lineStart+pchSider,cellSize*i+lineStart+pchSider,cellSize*(i+1)+lineStart-pchSider]
           //x1,x2,y1,y2 计算pch的一条线
            //[cellSize*i+lineStart+0.05*cellSize,cellSize*(i+1)+lineStart-0.05*cellSize]// 计算pch另一条线
          )//x1,x2
					}
				}
				return outArray;
			}
		}
/*           */
//按照corr的产生颜色
		var colorSelector = function(v){

			var returnCol = new Array(3);
			if( (minValue <= v) && (maxValue >= v)){
				maxColRGB = maxCol.colorRgb()
				middleColRGB = middleCol.colorRgb()
				minColRGB = minCol.colorRgb()
				if (v > middleValue){
					percent = (v - middleValue)/(maxValue - middleValue)
					for (var i=0; i<3; i++){
						if (maxColRGB[i] > middleColRGB[i]) returnCol[i] = parseInt((maxColRGB[i] - middleColRGB[i]) * percent + middleColRGB[i]);
						else returnCol[i] = parseInt( middleColRGB[i] -(middleColRGB[i] - maxColRGB[i]) * percent);
					}
				}else{
					percent = (middleValue - v)/(middleValue - minValue);
					for (i=0; i<3; i++){
						if (minColRGB[i] < middleColRGB[i]) returnCol[i] = parseInt(middleColRGB[i] -(middleColRGB[i] - minColRGB[i]) * percent);
						else returnCol[i] =  parseInt((minColRGB[i] - middleColRGB[i]) * percent + middleColRGB[i]);
					}
				}
				return("RGB(" + returnCol.join(",") + ")")
			}else{
				alert( v + "unexpected false.")
			}
		}

/* ################ */
//水平线和垂直线的定义，计算

		$( "#legend" ).buttonset();
		$( "#diag" ).buttonset();
//
function init_corrplot( method){

lineStart = 0.1*w;
lineEnd = 0.85*w;
cellSize = (lineEnd - lineStart)/n;//cell的个数
maxR = 0.9 * cellSize;//应该是定义圈的最大最小值
minR = 0.1 * cellSize;
numLabelSize = 0.01*w
pchSider = 0.005*w
		for (i=0; i<n+1; i++){
			vLineArray[i] =  new Array(cellSize*i + lineStart, lineStart, cellSize*i + lineStart, lineEnd)
			hLineArray[i] = new Array(lineStart, cellSize*i + lineStart, lineEnd, cellSize*i + lineStart)
		}


//数据转换
	aData = parse_mvisCorrplotData(mvisCorrplotData["matrixData"])
	//console.log(aData)

	if (method=="circle"){

//       console.log(newSeq)

		var cells = svg.selectAll(".cells").data(aData)
			.enter()
			.append("circle")
			/*changed 11-01 .attr("r", function(d){return d[0];})
			.attr("cx", function(d,i){ return d[1];})
			.attr("cy", function(d,i){ return d[2];})
			.attr("fill", function(d){return d[3];})
			.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
			.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
		*/
// outArray[i*n+j] = new Array(r, cx, cy, color, a[i][j], cellSize*j+lineStart, cellSize*i+lineStart )

			.attr("r", function(d){return d[0];})
			.attr("fill", function(d){return d[3];})
      //第几行，Math.floor(i/n)
			.attr("cx", function(d,i){ return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart);})
      //第几列，i%n,取余数
      .attr("cy", function(d,i){return (cellSize*( newSeq[i%n]-0.5) + lineStart);})
			.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})


/* 椭圆挺难看的，需要想个办法修改一下 */
}
else if (method=="ellipse"){//
		var cells = svg.selectAll(".cells").data(aData)
				.enter()
				.append("ellipse")
				/*changed 11-01 .append("ellipse")
				.attr("cx", function(d){return d[1];})
				.attr("cy", function(d){ return d[2];})
				.attr("fill", function(d){return d[3];})
				.attr("ry", function(d){return cellSize/2 - Math.abs(d[0]) ;})
				.attr("rx", cellSize/2)
				.attr("transform", function(d){ if (d[4]>0) {return "rotate( -45," + d[1] +","+d[2]+")"}else{ return "rotate( 45," + d[1] +","+d[2]+")"} })
				.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
		*/
				.attr("cx", function(d,i){ return (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart);})
				.attr("cy", function(d,i){ return (cellSize*( newSeq[i%n] - 0.5) + lineStart) ;})
				.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})
				.attr("ry", function(d){return cellSize/2 - Math.abs(d[0]) ;})
				.attr("rx", cellSize/2)
				.attr("transform",function(d,i){
					if (d[4]>0) return "rotate( -45," + (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart) +","+(cellSize*( newSeq[i%n] - 0.5) + lineStart)+")";
					else return "rotate( 45," + (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart) +","+(cellSize*( newSeq[i%n] - 0.5) + lineStart)+")"})
				.attr("fill", function(d){return d[3];})

	}else if (method == "square"){
		var cells = svg.selectAll(".cells").data(aData)
				.enter()
				.append("rect")
				/*changed 11-01 .attr("x", function(d){return d[1] - d[0];})
				.attr("y", function(d){ return d[2] - d[0];})
				.attr("fill", function(d){return d[3];})
				.attr("width", function(d){return 2*d[0]})
				.attr("height", function(d){return 2*d[0]})
				.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
				*/
				.attr("fill", function(d){return d[3];})
				.attr("width", function(d){return 2*d[0]})
				.attr("height", function(d){return 2*d[0]})//
				.attr("x", function(d,i){return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart) - d[0];})
				.attr("y", function(d,i){ return (cellSize*( newSeq[i%n]-0.5) + lineStart) - d[0];})
				.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})
      }

	/*	info = "x:"+ 0+";y:"+0
	var infoLabel = svg.selectAll(".info").data([1]).enter().append("text")
			.attr("x", 20).attr("y",20)
			.text(info).attr("class","info")
	*/
//	console.log({newSeq:newSeq})
  //在cell上添加数字

			var numLabel = svg.selectAll(".numLabelNormal").data(aData).enter().append("text")
				.attr("x", function(d,i){ return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart);})
				.attr("y", function(d,i){ return (cellSize*( newSeq[i%n]-0.45) + lineStart);})// 这里完全按照效果，可能需要一点靠谱的解释
				.attr("class", function(d,i){ return("numLabelNormal numLabel_Y_"+ (newSeq[i%n] -1) ) +" numLabel_X_"+ (newSeq[Math.floor(i/n)] -1);})
				.text(function(d){return(parseFloat(d[4]).toFixed(3));})//确定保留几位小数
				.attr("fill", function(d){ return (parseFloat(d[4])>middleValue) ? "#ffa500":"green"})
//使用visibility属性来确定是否显示数字
        .attr("visibility", function(d, i) {
					a1 = newSeq[Math.floor(i/n)];
					a2 = newSeq[i%n];
					if (numShow){
						if (diagShow=="diagLower"){
							return  a1>a2?"hidden":"visible";
						}else if(diagShow=="diagUpper"){
							return  a1<a2?"hidden":"visible";
						}else if(diagShow=="diagFull"){
							return "visible";}
					}else{
						return "hidden";
						}
					})
				.attr("font-size",numLabelSize)
//定义cell的每个矩形
	var rect = svg.selectAll(".rect").data(aData).enter().append("rect")
				.attr("x", function(d,i){return  d[5]})
				.attr("y", function(d,i){return  d[6]})
				.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("rectCellNormal rect_Y_"+a1+" rect_X_"+a2);})
				.attr("width",cellSize)
				.attr("height",cellSize)
				.attr("stroke", "grey")
				.attr("fill","grey")
				.style("opacity", 0)


	// Fixed
//Y 坐标
	var axisLabel_Y = svg.selectAll(".axis_YNormal").data(mvisCorrplotData["colNames"]).enter().append("text")
			.attr("class", function(d,i){return "axis_YNormal text_Y_" + (newSeq[i]-1)})
			.attr("x", lineStart-3)
			.attr("y", function(d,i){return (newSeq[i]-0.5)*cellSize+lineStart+5;})
			.text(function(d){return d;})
			.attr("font-size",numLabelSize*2)
//console.log("add axis")
	//Fixed
  //x坐标
	var axisLabel_X = svg.selectAll(".axis_XNormal").data(mvisCorrplotData["colNames"]).enter().append("text")
		.attr("class", function(d,i){return "axis_XNormal text_X_" + (newSeq[i]-1) })
		.attr("x", lineStart+3)
		.attr("y", function(d,i){return (newSeq[i]-0.5)*cellSize+lineStart+5;})
		.attr("transform", "rotate(-90,"+lineStart+","+lineStart+")")
    //90度在坐标轴上方
		.text(function(d){return d;})
    .attr("font-size",numLabelSize*2)
//	vLineArray[i] =
// new Array(cellSize*i + lineStart, lineStart, cellSize*i + lineStart, lineEnd)
//  hLineArray[i] =
//new Array(lineStart, cellSize*i + lineStart, lineEnd, cellSize*i + lineStart)
/*  这一段是实现矩阵的网格生成和动态 */
//console.log({"vL":vLineArray});
//console.log({"vL1":vLineArray[0][0]});
	var yLines = svg.selectAll(".yLines").data(vLineArray).enter().append("line")
				.attr("x1", function(d,i){return d[0];})
				.attr("y1", function(d,i){return d[1];})
//起点和终点相同，但是还是line，可以使用动态来实现，线的展开
				.attr("x2", function(d,i){return d[0];})
				.attr("y2", function(d,i){return d[1];})
				.attr("stroke", "gray").attr("stroke-width",1)
				.attr("class", "yLines")

	yLines.transition().duration(800).delay(500)
				.attr("x2", function(d,i){return d[2];})
				.attr("y2", function(d,i){return d[3];})
				.attr("stroke", "gray").attr("stroke-width",1)

	var xLines = svg.selectAll(".xLines").data(hLineArray).enter().append("line")
				.attr("x1", function(d,i){return d[0];})
				.attr("y1", function(d,i){return d[1];})
				.attr("x2", function(d,i){return d[0];})
				.attr("y2", function(d,i){return d[1];})
				.attr("stroke", "gray").attr("stroke-width",1)
				.attr("class", "xLines")


	xLines.transition().duration(800).delay(1000)
				.attr("x2", function(d,i){return d[2];})
				.attr("y2", function(d,i){return d[3];})
				.attr("stroke", "gray").attr("stroke-width",1)
/* */

	gradientColor = [maxCol, middleCol, minCol];
/*画出legend*/
	var drawLegend = function(){
			var legend = svg.selectAll("legend")
					.data([1]).enter()//经常使用data([1])来添加一个元素？？？
					.append("g")
			var legendWidth = 0.05*w;
			var rectGradient = legend.selectAll("rectgradient")
					.data([1])
					.enter().append("rect")
					.attr("id", "rectGradient")
					.attr("x", w-legendWidth*2.2)
					.attr("y", lineStart)
					.attr("width", legendWidth)
					.attr("height", cellSize*n)
					.attr("fill","url(#grad2)")//url id=grad2


//
			var legendLabelDefine =  function(maxValue, minValue){
				nOfLabel = 11;//label上显示11个数字
				heightStep = cellSize*n/(nOfLabel-1)
				numStep = (maxValue-minValue)/(nOfLabel-1)
				var returnArray = new Array()
				for (i=0; i<nOfLabel; i++){
					returnArray.push(new Array(w-legendWidth*1.2, lineStart+(i*heightStep), parseFloat(maxValue-i*numStep).toFixed(1) ))
				}

				return returnArray;
			}



			var legendData = legendLabelDefine(maxValue, minValue)
			var legendGroup = legend.selectAll(".legendGroup")
					.data(legendData)
					.enter()
					.append("g")

			var legendLine = legendGroup.selectAll(".legendLine")//画label伸出来的那一段
      //刻度
					.data(legendData)
					.enter()
					.append("line")
					.attr("x1", function(d){return d[0];})
					.attr("y1", function(d){return (d[1] + (parseFloat(d[2])>middleValue?1:-1) );})
					.attr("x2", function(d){return d[0]+5;})
					.attr("y2", function(d){return (d[1] +  (parseFloat(d[2]) > middleValue?1:-1) );})
					.attr("stroke", "gray").attr("stroke-width",1)

			var legendText = legendGroup.selectAll(".legendText")
					.data(legendData)
					.enter()
					.append("text")
					.attr("x", function(d){return d[0] +8;})
					.attr("y", function(d){return (d[1]+  (parseFloat(d[2])>middleValue?1:-1));})
					.text( function(d){return d[2];})
					//.style("text-anchor","middle")
					.style("dominant-baseline","central")
		}
	drawLegend();
/*    */

	var overCell =  function(d,i){
    // 原来是这样实现的！！！
			var y = Math.floor(i/n)//取行
				x = i%n//取列
//鼠标放在元素上面，元素会变大
			if (method=="circle"){
				svg.selectAll(".cell_Y_"+y).transition().duration(500).delay(200)
        //一个元素可以使用多个class？，并使用空格ge隔开隔开？
					.attr("r", function(d){return d[0]*1.1;})

				svg.selectAll(".cell_X_"+x).transition().duration(500).delay(200)
					.attr("r", function(d){return d[0]*1.1;})
			}else if (method == "ellipse"){
				svg.selectAll(".cell_Y_"+y).transition().duration(500).delay(200)
					.attr("ry", function(d){return 1.1*(cellSize/2 - Math.abs(d[0]));})

				svg.selectAll(".cell_X_"+x).transition().duration(500).delay(200)
					.attr("ry", function(d){return 1.1*(cellSize/2 - Math.abs(d[0]));})
			}else if (method == "square"){
				svg.selectAll(".cell_Y_"+y).transition().duration(500).delay(200)
					.attr("width", function(d){return 2.2*d[0]})
					.attr("height", function(d){return 2.2*d[0]})
				svg.selectAll(".cell_X_"+x).transition().duration(500).delay(200)
					.attr("width", function(d){return 2.2*d[0]})
					.attr("height", function(d){return 2.2*d[0]})
			}
			info = "x:"+ x+";y:"+y

			//svg.selectAll(".info")
				//.transition().duration(100).delay(200)
			//.text(info)


//onsole.log({"newseq":newSeq})
			svg.selectAll(".rect_X_"+x).transition().duration(100).delay(200)
				.style("opacity", 0.2)//透明度
			svg.selectAll(".rect_Y_"+y).transition().duration(100).delay(200)
				.style("opacity", 0.2)
				svg.selectAll(".numLabelNormal").data(aData).enter().append("text")
        //向元素中添加相关性值

// 选择让选中的元素的该列和该行的num进行显示
			svg.selectAll(".numLabel_Y_"+y).transition().duration(500).delay(200)
				.attr("visibility", function(d,i){// 利用遍历实现 full 上下三角的不同显示方法
					if (diagShow=="diagLower"){
						return  newSeq[i] > y+1 ?"hidden":"visible";
					}else if(diagShow=="diagUpper"){
						return  newSeq[i] <= y ?"hidden":"visible";
					}else if(diagShow=="diagFull"){
						return "visible";}
					})
				.attr("font-size",1.5*numLabelSize)  //visible

			svg.selectAll(".numLabel_X_"+x).transition().duration(500).delay(200)
				.attr("visibility", function(d,i){
					if (diagShow=="diagLower"){
						return  newSeq[i] < x+1 ?"hidden":"visible";
					}else if(diagShow=="diagUpper"){
						return  newSeq[i] > x+1 ?"hidden":"visible";
					}else if(diagShow=="diagFull"){
						return "visible";}
					})
				.attr("font-size",1.5*numLabelSize)


			svg.select(".text_Y_"+y).transition().duration(500).delay(200)
				.attr("font-size", 3*numLabelSize)
				.attr("font-weight","bold")
				.attr("fill","#f00")

// x轴的坐标名会变化。没有使用旋转实现，利用duration自动实现
			if (diagShow == "diagLower"){
				svg.select(".text_X_"+x).transition().duration(200).delay(200)
					.attr("x", (x+0.5)*cellSize+lineStart-5)
					.attr("y", lineStart-15+ x*cellSize)
					.attr("font-size", "23px")
					.attr("font-weight","bold")
					.attr("fill","#f00")
					.attr("transform", "")
					.attr("text-anchor", "middle")
			}else{
				svg.select(".text_X_"+x).transition().duration(200).delay(200)
				.attr("x", (x+0.5)*cellSize+lineStart-5)
				.attr("y", lineStart-15)
				.attr("font-size", 3*numLabelSize)
				.attr("font-weight","bold")
				.attr("fill","#f00")
				.attr("transform", "")
				.attr("text-anchor", "middle")

			}

	}

	var outCell = function(d,i){


		var y = Math.floor(i/n)
			x = i%n
		//alert(numShow)
			//alert("x:"+ x+"y:"+y)
			svg.selectAll(".numLabelNormal").transition().duration(500).delay(200)
			.attr("visibility", function(u,m){
				if (numShow == true){
					a1 = newSeq[Math.floor(m/n)];
					a2 = newSeq[m%n];
					if (diagShow=="diagLower"){
						return  a1>a2?"hidden":"visible";
					}else if(diagShow=="diagUpper"){
						return  a1<a2?"hidden":"visible";
					}else if(diagShow=="diagFull"){
						return "visible";}
					}else{
						return "hidden";
					}
				})
			.attr("font-size",numLabelSize)//visible


		svg.selectAll("rect.tmp_rectv").transition().duration(500).delay(200)
			.remove()
		svg.selectAll("rect.tmp_recth").transition().duration(500).delay(200)
			.remove()

		if (method=="circle"){
		svg.selectAll(".cell_Y_"+y).transition().duration(500).delay(200)
			.attr("r", function(d){return d[0];})

		svg.selectAll(".cell_X_"+x).transition().duration(500).delay(200)
			.attr("r", function(d){return d[0];})
		}else if (method == "ellipse"){
		svg.selectAll(".cell_Y_"+y).transition().duration(500).delay(200)
			.attr("ry", function(d){return (cellSize/2 - Math.abs(d[0]));})

		svg.selectAll(".cell_X_"+x).transition().duration(500).delay(200)
			.attr("ry", function(d){return (cellSize/2 - Math.abs(d[0]));})
		}else if (method == "square"){
		svg.selectAll(".cell_Y_"+y).transition().duration(500).delay(200)
			.attr("width", function(d){return 2*d[0]})
			.attr("height", function(d){return 2*d[0]})
		svg.selectAll(".cell_X_"+x).transition().duration(500).delay(200)
			.attr("width", function(d){return 2*d[0]})
			.attr("height", function(d){return 2*d[0]})
		}

		svg.selectAll(".rect_X_"+x).transition().duration(100).delay(200)
			.style("opacity", 0)
		svg.selectAll(".rect_Y_"+y).transition().duration(100).delay(200)
			.style("opacity", 0)

		svg.select(".text_Y_"+y).transition().duration(500).delay(200)
			.attr("font-size", 2*numLabelSize)
			.attr("font-weight","normal")
			.attr("fill","black")

		svg.select(".text_X_"+x).transition().duration(200).delay(200)
			.attr("x", lineStart+3 - x*cellSize)
			//.attr("x", lineStart+3)
			.attr("y", (x+0.5)*cellSize+lineStart+5)
			.attr("transform", "rotate(-90,"+lineStart+","+lineStart+")")
			.attr("font-size", 2*numLabelSize)
			.attr("font-weight","normal")
			.attr("fill","black")
			.attr("text-anchor", "left")

		if (diagShow == "diagLower"){
				svg.select(".text_X_"+x).transition().duration(200).delay(200)
					.attr("x", lineStart+3 - x*cellSize)
					//.attr("x", lineStart+3)
					.attr("y", (x+0.5)*cellSize+lineStart+5)
					.attr("transform", "rotate(-90,"+lineStart+","+lineStart+")")
					.attr("font-size", 2*numLabelSize)
					.attr("font-weight","normal")
					.attr("fill","black")
					.attr("text-anchor", "left")

			}else{
				svg.select(".text_X_"+x).transition().duration(200).delay(200)
					.attr("x", lineStart+3)
					.attr("y", (x+0.5)*cellSize+lineStart+5)
					.attr("transform", "rotate(-90,"+lineStart+","+lineStart+")")
					.attr("font-size", 2*numLabelSize)
					.attr("font-weight","normal")
					.attr("fill","black")
					.attr("text-anchor", "left")

			}


	}

//实现鼠标 on
	rect.on("mouseover.tooltip",overCell)
//鼠标离开，恢复
	rect.on("mouseout.tooltip",outCell)


//计算sig的显示东西
//设定sig

console.log(pMat.length);
//找到pMat大于标准的 0.05 的

//大于0.05为0，小于为1
/*cellSize*j+lineStart, cellSize*i+lineStart*/


/*			.attr("x", function(d,i){return  d[5]})
      .attr("y", function(d,i){return  d[6]})
      .attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("rectCellNormal rect_Y_"+a1+" rect_X_"+a2);})
      .attr("width",cellSize)
      .attr("height",cellSize)
      .attr("stroke", "grey")
      .attr("fill","grey")
      .style("opacity", 0)
      */
//绘制叉号


var sigpchx = new Array();
var sigpchy = new Array();
for(var i=0;i<n;i++){
for(var j=0;j<n;j++){
sigpchx[n*i+j] = new Array( aData[n*i+j][7][0],aData[n*i+j][7][1],aData[n*i+j][7][2],aData[n*i+j][7][3]);//y1,y2,x1,x2,
sigpchy[n*i+j] = new Array( aData[n*i+j][8][0],aData[n*i+j][8][1],aData[n*i+j][8][2],aData[n*i+j][8][3]);//y1,y2,x1,x2,
}
}
function drawPch (newSeq,diagShow){
var sigArray = new Array();
console.log(sigArray)
for(var i=0;i<n;i++){
for(var j=0;j<n;j++){
sigArray[n*(newSeq[i]-1)+(newSeq[j]-1)] = SigArray[n*i+j];
}}
console.log(sigArray)
svg.selectAll(".sigNormalI").remove()
svg.selectAll(".sigNormalII").remove()
var sigI = svg.selectAll("#significance_I").data(sigpchx).enter().append("line")
.attr("x1",function(d){return d[0]}).attr("y1",function(d){return d[2]})
.attr("x2",function(d){return d[1]}).attr("y2",function(d){return d[3]})
.attr("stroke","black").attr("stroke-width",1)
.attr("class",function(d,i){
  var x = i/n, y = i%n;
  return 'sigNormalI sig_X_'+x+' sig_Y_'+y;
});

var sigII = svg.selectAll("#significance_II").data(sigpchy).enter().append("line")
.attr("x1",function(d){return d[0]}).attr("y1",function(d){return d[2]})
.attr("x2",function(d){return d[1]}).attr("y2",function(d){return d[3]})
.attr("stroke","black").attr("stroke-width",1)
.attr("class",function(d,i){
  var x = Math.floor(i/n), y = i%n;
  return 'sigNormalII sig_X_'+x+' sig_Y_'+y;
});

d3.selectAll('.sigNormalI').attr("visibility",function(u,m){

var a1 = Math.floor(m/n)//取行
var a2 = m%n//取列

if(sigArray[m]==1){return "hidden"}else if (diagShow=="diagLower"){
  return  a1<a2?"hidden":"visible";
}else if(diagShow=="diagUpper"){
  return  a1>a2?"hidden":"visible";
}else if(diagShow=="diagFull"){
  return "visible";}else{
return "hidden";}
})
d3.selectAll('.sigNormalII').attr("visibility",function(u,m){

  var a1 = Math.floor(m/n)//取行
  var a2 = m%n//取列

  if(sigArray[m]==1){return "hidden"}else if (diagShow=="diagLower"){
    return  a1<a2?"hidden":"visible";
  }else if(diagShow=="diagUpper"){
    return  a1>a2?"hidden":"visible";
  }else if(diagShow=="diagFull"){
    return "visible";}else{
  return "hidden";
  }
})
}

drawPch(newSeq=newSeq,diagShow=diagShow)
/*.attr("x1",function(d,i){
    var y = Math.floor(i/n)//取行
      x = i%n//取列

var x1 = d3.select('.rect_X_'+x+' rect_Y_'+y).attr("x")
  return x1})
.attr("y1",function(d,i){
  var y = Math.floor(i/n)//取行
    x = i%n//取列

var y1 = d3.select('.rect_X_'+x+' rect_Y_'+y).attr("y")
return y1
})
.attr("x2",function(d,i){
  var y = Math.floor(i/n)//取行
    x = i%n//取列

var x2 = d3.select('.rect_X_'+x+' rect_Y_'+y).attr("x")+cellSize
return x2
})
.attr("y2",function(d,i){
  var y = Math.floor(i/n)//取行
    x = i%n//取列

var y2 = d3.select('.rect_X_'+x+' rect_Y_'+y).attr("y")+cellSize
return y2
})
*/
//
//  var sig = d3.selectAll(".significance").append("line")
  //				.attr("x", function(d,i){ return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart);})
  //				.attr("y", function(d,i){ return (cellSize*( newSeq[i%n]-0.45) + lineStart);})// 这里完全按照效果，可能需要一点靠谱的解释
  // var sig = d3.selectAll(".significance").append("line")



//sigDraw()

//console.log(aData[7])
/*
var digLineII = d3.svg.line()
.x(function(d){return 1*d[5]+0.05*cellSize;})
.y(function(d){return 1*d[5]+0.05*cellSize;})
*/

///

/*按钮*/
/*
$("#sigshow").click(function(){
if ($(this).val()=="sigshow"){
  sigShow = true;
$("#sigshow").text("sighidden")
$("#sigshow").val("sighidden")
//
svg.select()

}else{
sigShow = false;
$("#sigshow").text("sigshow")
$("#sigshow").val("sigshow")
}


})

//
*/

//显示数字按钮

$("button[id=numShow]").click(
		function(){
			if ($(this).val()=="show"){
				numShow = true;
        //点完之后，按钮就变回hidden了
				$("#numShow").text("Hidden")
				$("#numShow").val("hidden")
				svg.selectAll(".numLabelNormal")
				.attr("visibility", function(u,m){
						if (numShow == true){
							a1 = newSeq[Math.floor(m/n)];
							a2 = newSeq[m%n];
							if (diagShow=="diagLower"){
								return  a1>a2?"hidden":"visible";
							}else if(diagShow=="diagUpper"){
								return  a1<a2?"hidden":"visible";
							}else if(diagShow=="diagFull"){
								return "visible";}
							}else{
								return "hidden";
							}
						})
			}else{
				numShow = false;
				$("#numShow").text("Show")
				$("#numShow").val("show")

				svg.selectAll(".numLabelNormal").attr("visibility", "hidden")
			}
		}
	)
// legend


	$('#legendDiv').on('change', function() {
		//console.log( $('#diagDiv input:radio:checked').attr("id"));

		d3.selectAll(".cell").remove()//这句是很关键的。。。可以使用无顾虑的enter()

		//method = "diag" + $('#diagDiv input:radio:checked').attr("id");
		method = $('#legendDiv input:radio:checked').attr("id");
		//console.log( $('#legendDiv input:radio:checked').attr("id"));

	if (method=="circle"){

		var cells = svg.selectAll(".cells").data(aData)
			.enter()
			.append("circle")
			/*changed 11-01 .attr("r", function(d){return d[0];})
			.attr("cx", function(d,i){ return d[1];})
			.attr("cy", function(d,i){ return d[2];})
			.attr("fill", function(d){return d[3];})
			.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
		*/
			.attr("r", function(d){return d[0];})
			.attr("fill", function(d){return d[3];})
			.attr("cx", function(d,i){ return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart);})
			.attr("cy", function(d,i){return (cellSize*( newSeq[i%n]-0.5) + lineStart);})
			.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})


	}else if (method=="ellipse"){
		var cells = svg.selectAll(".cells").data(aData)
				.enter()
				.append("ellipse")
				/*changed 11-01 .append("ellipse")
				.attr("cx", function(d){return d[1];})
				.attr("cy", function(d){ return d[2];})
				.attr("fill", function(d){return d[3];})
				.attr("ry", function(d){return cellSize/2 - Math.abs(d[0]) ;})
				.attr("rx", cellSize/2)
				.attr("transform", function(d){ if (d[4]>0) {return "rotate( -45," + d[1] +","+d[2]+")"}else{ return "rotate( 45," + d[1] +","+d[2]+")"} })
				.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
		*/
				.attr("cx", function(d,i){ return (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart);})
				.attr("cy", function(d,i){ return (cellSize*( newSeq[i%n] - 0.5) + lineStart) ;})
				.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})
				.attr("ry", function(d){return cellSize/2 - Math.abs(d[0]) ;})
				.attr("rx", cellSize/2)
				.attr("transform",function(d,i){
					if (d[4]>0) return "rotate( -45," + (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart) +","+(cellSize*( newSeq[i%n] - 0.5) + lineStart)+")";
					else return "rotate( 45," + (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart) +","+(cellSize*( newSeq[i%n] - 0.5) + lineStart)+")"})
				.attr("fill", function(d){return d[3];})


	}else if (method == "square"){
		var cells = svg.selectAll(".cells").data(aData)
				.enter()
				.append("rect")
				/*changed 11-01 .attr("x", function(d){return d[1] - d[0];})
				.attr("y", function(d){ return d[2] - d[0];})
				.attr("fill", function(d){return d[3];})
				.attr("width", function(d){return 2*d[0]})
				.attr("height", function(d){return 2*d[0]})
				.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
				*/
				.attr("fill", function(d){return d[3];})
				.attr("width", function(d){return 2*d[0]})
				.attr("height", function(d){return 2*d[0]})
				.attr("x", function(d,i){return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart) - d[0];})
				.attr("y", function(d,i){ return (cellSize*( newSeq[i%n]-0.5) + lineStart) - d[0];})
				.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})
		}


		svg.selectAll(".numLabelNormal").remove()
		var numLabel = svg.selectAll(".numLabelNormal").data(aData).enter().append("text")
					.attr("x", function(d,i){ return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart);})

					.attr("y", function(d,i){ return (cellSize*( newSeq[i%n]-0.5) + lineStart-5);})
					.attr("class", function(d,i){ return("numLabelNormal numLabel_Y_"+ (newSeq[i%n] -1) ) +" numLabel_X_"+ (newSeq[Math.floor(i/n)] -1);})
					.text(function(d){return(parseFloat(d[4]).toFixed(3));})
					.attr("fill", function(d){ return (parseFloat(d[4])>middleValue) ? "orange":"green"})
					//.attr("visibility", "hidden")
					.attr("font-size",numLabelSize)

		svg.selectAll(".rectCellNormal").remove()
		rect = svg.selectAll(".rectCellNormal")
					.data(aData).enter().append("rect")
					.attr("x", function(d,i){return  d[5]})
					.attr("y", function(d,i){return  d[6]})
					.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("rectCellNormal rect_Y_"+a1+" rect_X_"+a2);})
					.attr("width",cellSize)
					.attr("height",cellSize)
					.attr("stroke", "red")
					.attr("fill","grey")
					.style("opacity", 0)

		diagInit("diag" + $('#diagDiv input:radio:checked').attr("id"))
	rect.on("mouseover.tooltip",overCell)
	rect.on("mouseout.tooltip",outCell)



	});

	function diagInit(diagShow){
// diag 显示
		var t = svg.transition().duration(500);
//cell 元素上下三角显示
		var cells = t.selectAll(".cell")
				cells.attr("visibility", function(d, i) {
					a1 = newSeq[Math.floor(i/n)];
					a2 = newSeq[i%n];
					if (diagShow=="diagLower"){
						return  a1>a2?"hidden":"visible";
					}else if(diagShow=="diagUpper"){
						return  a1<a2?"hidden":"visible";
					}else if(diagShow=="diagFull"){
						return "visible";}})
// rect 显示
			var rects = t.selectAll(".rectCellNormal")
				rects.attr("visibility", function(d, i) {
					a1 = Math.floor(i/n);
					a2 = i%n;

					if (diagShow=="diagLower"){
						return  a1<a2?"hidden":"visible";
					}else if(diagShow=="diagUpper"){
						return  a1>a2?"hidden":"visible";
					}else if(diagShow=="diagFull"){
						return "visible";}})
// 相应的numlabels
			var numLabel = t.selectAll(".numLabelNormal")
				numLabel.attr("visibility", function(d, i) {
					a1 = newSeq[Math.floor(i/n)];
					a2 = newSeq[i%n];
					if (numShow){
						if (diagShow=="diagLower"){
							return  a1>a2?"hidden":"visible";
						}else if(diagShow=="diagUpper"){
							return  a1<a2?"hidden":"visible";
						}else if(diagShow=="diagFull"){
							return "visible";}
					}else{
						return "hidden";
						}
					})

			if (diagShow=="diagLower"){
				var axisLabel_Y = t.selectAll(".axis_YNormal")
						.attr("x", lineStart-3)
				var axisLabel_X = t.selectAll(".axis_XNormal")
						.attr("x", function(d,i){return(lineStart+3 - (newSeq[i]-1)*cellSize)})
//对lines的
				t.selectAll(".yLines")
					.attr("x1", function(d,i){return d[0];})
					.attr("y1", function(d,i){if (i>0)return ((i-1)*cellSize+lineStart); else return d[0];})
					.attr("x2", function(d,i){return d[2];})
					.attr("y2", function(d,i){return d[3];})
				t.selectAll(".xLines")
					.attr("x1", function(d,i){return d[0];})
					.attr("y1", function(d,i){return d[1];})
					.attr("x2", function(d,i){if (i<n)return ((i+1)*cellSize+lineStart); else return d[3];})
					.attr("y2", function(d,i){return d[3];})

			}else if (diagShow=="diagUpper"){

				var axisLabel_Y = t.selectAll(".axis_YNormal")
						.attr("x", function(d,i){return(lineStart-3 + (newSeq[i]-1)*cellSize)})
				var axisLabel_X = t.selectAll(".axis_XNormal")
						.attr("x", lineStart+3)

				t.selectAll(".yLines")
					.attr("x1", function(d,i){return d[0];})
					.attr("y1", function(d,i){return d[1];})
					.attr("x2", function(d,i){return d[2];})
					.attr("y2", function(d,i){if (i<n)return ((i+1)*cellSize+lineStart); else return d[3];})
				t.selectAll(".xLines")
					.attr("x1", function(d,i){if (i>0)return ((i-1)*cellSize+lineStart); else return d[0];})
					.attr("y1", function(d,i){return d[1];})
					.attr("x2", function(d,i){return d[2];})
					.attr("y2", function(d,i){return d[3];})

			}else{
				var axisLabel_Y = t.selectAll(".axis_YNormal")
						.attr("x", lineStart-3)
				var axisLabel_X = t.selectAll(".axis_XNormal")
						.attr("x", lineStart+3)

				t.selectAll(".yLines")
					.attr("x1", function(d,i){return d[0];})
					.attr("y1", function(d,i){return d[1];})
					.attr("x2", function(d,i){return d[2];})
					.attr("y2", function(d,i){return d[3];})
				t.selectAll(".xLines")
					.attr("x1", function(d,i){return d[0];})
					.attr("y1", function(d,i){return d[1];})
					.attr("x2", function(d,i){return d[2];})
					.attr("y2", function(d,i){return d[3];})
			}


		/*var axisLabel_Y = svg.selectAll(".axis_Y").data(mvisCorrplotData["colNames"]).enter().append("text")
			.attr("class", function(d,i){return "axis_Y text_Y_" + (newSeq[i]-1)})
			.attr("x", lineStart-3)
			.attr("y", function(d,i){return (newSeq[i]-0.5)*cellSize+lineStart+5;})
			.text(function(d){return d;})
			.attr("font-size","18px")
	var axisLabel_X = svg.selectAll(".axis_X").data(mvisCorrplotData["colNames"]).enter().append("text")
		.attr("class", function(d,i){return "axis_X text_X_" + (newSeq[i]-1) })
		.attr("x", lineStart+3)
		.attr("y", function(d,i){return (newSeq[i]-0.5)*cellSize+lineStart+5;})
		.attr("transform", "rotate(-90,"+lineStart+","+lineStart+")")
		.text(function(d){return d;})
	*/



	};


	function changeSeq(newSeq, method){


console.log({"seqInChange":newSeq})
		var t = svg.transition().duration(500);
		t.selectAll(".axis_YNormal")
			.delay(function(d, i) { return i * 40; })
			.attr("x", function(d,i){if(diagShow=="diagUpper") {return(lineStart-3 + (newSeq[i]-1)*cellSize);} else {return(lineStart-3)}})
			.attr("y", function(d,i){return (newSeq[i]-0.5)*cellSize+lineStart+5;})
			.attr("class", function(d,i){return "axis_YNormal text_Y_" + (newSeq[i]-1)})
			//.attr("transform", function(d, i) {return "translate(0," + ((newSeq[i]-i-1)*cellSize) + ")"; })
//console.log(t.selectAll(".axis_YNormal").attr("y"))

		t.selectAll(".axis_XNormal")
			.delay(function(d, i) { return i * 40; })
			.attr("x", function(d,i){ if (diagShow=="diagLower") {return(lineStart+3 - (newSeq[i]-1)*cellSize)} else {return(lineStart+3)}})
			.attr("y", function(d,i){return (newSeq[i]-0.5)*cellSize+lineStart+5;})
			.attr("class", function(d,i){return "axis_XNormal text_X_" + (newSeq[i]-1) })

	/*.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
					.attr("cx", function(d){return d[1];})
				.attr("cy", function(d){ return d[2];})
				.attr("fill", function(d){return d[3];})
				.attr("ry", function(d){return cellSize/2 - Math.abs(d[0]) ;})
				.attr("rx", cellSize/2)
				.attr("transform", function(d){ if (d[4]>0) {return "rotate( -45," + d[1] +","+d[2]+")"}else{ return "rotate( 45," + d[1] +","+d[2]+")"} })
				.attr("class", function(d,i){ a1 = Math.floor(i/n); a2 = i%n; return("cell cell_Y_"+a1+" cell_X_"+a2);})
		*/

		//cellSize*(j+0.5) + lineStart
		if(method == "ellipse"){
			t.selectAll(".cell")
				.delay(function(d, i) { return i * 4; })
				.attr("cx", function(d,i){ return (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart);})
				.attr("cy", function(d,i){ return (cellSize*( newSeq[i%n] - 0.5) + lineStart) ;})
				.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})
				.attr("transform",function(d,i){
					if (d[4]>0) return "rotate( -45," + (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart) +","+(cellSize*( newSeq[i%n] - 0.5) + lineStart)+")";
					else return "rotate( 45," + (cellSize*(newSeq[Math.floor(i/n)] - 0.5)  + lineStart) +","+(cellSize*( newSeq[i%n] - 0.5) + lineStart)+")"})

		}else if (method == "circle"){
			t.selectAll(".cell")
				.delay(function(d, i) { return i * 4; })
				.attr("cx", function(d,i){ return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart);})
				.attr("cy", function(d,i){return (cellSize*( newSeq[i%n]-0.5) + lineStart);})
				.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})
				//.attr("transform",function(d){ if (d[4]>0) {return "rotate( -45," + (cellSize*( 1.5) + lineStart) +","+(cellSize*( 1.5) + lineStart)+")"}
				//	else{ return "rotate( 45," + (cellSize*( newSeq[Math.floor(i/n)]+0.5) + lineStart) +","+(cellSize*( newSeq[i%n]+0.5) + lineStart)+")"} })
		}else if (method == "square") {
			t.selectAll(".cell")
				.delay(function(d, i) { return i * 4; })
				.attr("x", function(d,i){return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart) - d[0];})
				.attr("y", function(d,i){ return (cellSize*( newSeq[i%n]-0.5) + lineStart) - d[0];})
				.attr("class", function(d,i){ return("cell cell_Y_"+ (newSeq[i%n] -1) ) +" cell_X_"+ (newSeq[Math.floor(i/n)] -1);})
		}

		t.selectAll(".numLabelNormal")
				//.attr("visibility", "visible")
				.attr("x", function(d,i){ return (cellSize*( newSeq[Math.floor(i/n)]-0.5) + lineStart);})
				.attr("y", function(d,i){ return (cellSize*( newSeq[i%n]-0.45) + lineStart);})
				.attr("class", function(d,i){ return("numLabelNormal numLabel_Y_"+ (newSeq[i%n] -1) ) +" numLabel_X_"+ (newSeq[Math.floor(i/n)] -1);})
				//.text(function(d,i) {return(newSeq[Math.floor(i/n)] + ";" + newSeq[i%n])})
				//.attr("transform",function(d){ if (d[4]>0) {return "rotate( -45," + (cellSize*( 1.5) + lineStart) +","+(cellSize*( 1.5) + lineStart)+")"}
				//	else{ return "rotate( 45," + (cellSize*( newSeq[Math.floor(i/n)]+0.5) + lineStart) +","+(cellSize*( newSeq[i%n]+0.5) + lineStart)+")"} })



		var cells = t.selectAll(".cell")
				cells.attr("visibility", function(d, i) {
					a1 = newSeq[Math.floor(i/n)];
					a2 = newSeq[i%n];
					if (diagShow=="diagLower"){
						return  a1>a2?"hidden":"visible";
					}else if(diagShow=="diagUpper"){
						return  a1<a2?"hidden":"visible";
					}else if(diagShow=="diagFull"){
						return "visible";}})

			var rects = t.selectAll(".rectCellNormal")
				rects.attr("visibility", function(d, i) {
					a1 = Math.floor(i/n);
					a2 = i%n;

					if (diagShow=="diagLower"){
						return  a1<a2?"hidden":"visible";
					}else if(diagShow=="diagUpper"){
						return  a1>a2?"hidden":"visible";
					}else if(diagShow=="diagFull"){
						return "visible";}})

			var numLabel = t.selectAll(".numLabelNormal")
				numLabel.attr("visibility", function(d, i) {
					a1 = newSeq[Math.floor(i/n)];
					a2 = newSeq[i%n];
					if (numShow){
						if (diagShow=="diagLower"){
							return  a1>a2?"hidden":"visible";
						}else if(diagShow=="diagUpper"){
							return  a1<a2?"hidden":"visible";
						}else if(diagShow=="diagFull"){
							return "visible";}
					}else{
						return "hidden";
						}
					})


	}
/*add 2018-1-30 实现cell拖拽 */
//function DragExchange (d,i){


//var textDrag(d,i){
 var t = d3.behavior.drag()
.origin(function(d,i){
return {x:d3.select(this).attr("x"),
y:d3.select(this).attr("y")}})
.on("drag",function(d,i){
// text_Y
d3.select(this)
.attr("x",d.x=d3.event.x)
.attr("y",d.y=d3.event.y)
//var y = Math.floor(i/n)//
//var x = i%n//
//console.log({"i":i,"y":y,"x":x})
var rect_y = d3.selectAll(".rect_Y_"+i)
  .style({"opacity":0.2})
//console.log(".rect_Y_"+i)


//console.log(rect_y.size())
var textY = d3.selectAll(".axis_YNormal")
.on("mouseover",function(d,i){
d3.select(this).style({"opacity":0.2})
})
.on("mouseout",function(d,i){
d3.select(this).style({"opacity":1})
  })
})
.on("dragend",function(d,i){
var rect_y = d3.selectAll(".rect_Y_"+i)
.style({"opacity":0,"fill":"grey"})
})

//cells


//rect_y.attr("")



// 增添坐标动画
d3.selectAll(".axis_YNormal")
.on("mouseover",function(d,i){
d3.select(this).attr("fill","steelblue").attr("opacity",0.8)
.attr("font-size",function(d){
//  console.log(d3.select(this).attr("font-size"))
return "20px"})

//var y = Math.floor(i/n)//取列
//var x = i%n//取行




})
.on("mouseout",function(d,i){
d3.select(this).transition().duration(500)
.attr("fill","black")
.attr("opacity",1)
.attr("font-size",15)
})


//
d3.selectAll(".axis_XNormal")
.on("mouseover",function(d,i){
d3.select(this).attr("fill","steelblue").attr("opacity",0.8)
.attr("font-size",function(d,i){
//  console.log(d3.select(this).attr("font-size"))
return "20px"})
//.attr("x", (newSeq[i]+0.5)*cellSize+lineStart-5)
//.attr("y", lineStart-15)
})
.on("mouseout",function(d,i){
d3.select(this).transition().duration(500)
.attr("fill","black")
.attr("opacity",1)
.attr("font-size",15)
//.attr("y", lineStart+3)
//.attr("x", function(d,i){return (newSeq[i]-0.5)*cellSize+lineStart+5;})
//.attr("transform", "rotate(-90,"+lineStart+","+lineStart+")")

//.attr("transform","rotate(-90,"+lineStart+","+lineStart+")")
})



/*
function  textExchange (t){
if(t.on("mouseover").size())

}
*/

var tem = d3.selectAll(".axis_YNormal").call(t);

//tem.on("mouseover",function(){
//  console.log({"size":d3.event.size})
//})

//};



/**/

	$("#orderSelect").on("change", function() {
		//console.log(1233332)
		newSeq = mvisCorrplotData["orderList"][this.value]; changeSeq(newSeq , method=method)
    console.log(d3.selectAll(".axis_YNormal"))
drawPch(newSeq=newSeq,diagShow=diagShow)
	});


	$('#diagDiv').on('change', function(){
			diagShow = "diag" + $('#diagDiv input:radio:checked').attr("id")

			diagInit(diagShow)
    drawPch(newSeq=newSeq,diagShow=diagShow)
	});

// 按钮可以移动
  $(function() {
    $(".col-md-2").draggable();
  })

//  增加一个sortable板
//console.log({colNames:x["data"]["colNames"]})

//利用sortable bars来实现变换

//






//console.log({"newSeq":newSeq})

//console.log(getSeq())

//console.log(getSeq()==newSeq)

//console.log($(".sortBars").$("li:first").next().text())
//[0,1,2]  [1,0,2]  [1,0,2]
//console.log( {"zindex":$(".sortBars").sortable("option","zIndex")});

// 人为改变的bars

$("#barsSeq").on("click", function() {
  //console.log(1233332)

//  console.log(barSeq)
//  console.log(newSeq)
//newSeq = barSeq;

function  getSeq(){

var barSeq = new Array();
//var nowSeq = new Array();
var barText = new Array();
for(var i=0;i<colNames.length;i++){

/*for(var j=0;j<colNames.length;j++){
nowSeq[j] = colNames[newSeq[j]-1]

}*/
//console.log(nowSeq)


barText[i] =   $(".sortBars li:eq("+i+")").text();

}
console.log(barText)
for(var i=0;i<colNames.length;i++){

barSeq[i] = barText.indexOf(colNames[i])+1;//这里坑了很久。。。
}

//console.log(barSeq)
return barSeq;
}
newSeq = getSeq();
changeSeq( newSeq,method=method);//
drawPch();

console.log({"newSeq":newSeq})
console.log(d3.selectAll(".axis_YNormal"))

//


//console.log(barSeq.indexOf("mpg"))
});

//



/**/

/*2018-2-6 添加聚类的rects*/
//console.log(method)



/**/


		//var rects = svg.selectAll(".rect")
	}
//end init

function addBars(){

  function nameToHtml(){

  var nameBars = new String();
  for(var i=0;i<colNames.length;i++){


    for(var j=0;j<colNames.length;j++){
    nowSeq[j] = colNames[newSeq[j]-1]

    }

  var temBar = "<div><li>"+nowSeq[i]+"</li></div>";
  nameBars = nameBars+temBar;

  }

  return nameBars;
  }

  var nameBars = nameToHtml();
  //console.log(nameBars)


  d3.select("#bottonBox").append("div").attr("class","sortBars")
  .html(nameBars)
    var barsBotton = '<button type="button" id="barsSeq">barsSeq</button>';
  d3.select("#bottonBox").append("div").html(barsBotton)

  $(".sortBars").sortable();
}
  addBars()
/**/





/**/
	init_corrplot(method="circle")

/**/

$(function(){
$( "#svgSizeSlider" ).slider({
orientation: "horizontal",
min:100,max:1000,value:500,
});

$("#svgSizeSub").on("click",function(){
console.log(w)

d3.selectAll("#plotSVG").remove();

w = $("#svgSizeSlider").slider("value");
h = w;


svg = plotDiv.append("svg")
    .attr("width", w)//这里可以修改
    .attr("height", h)//
  .attr("id", "plotSVG");
//有点问题
//wrapDiv.selectAll("div").remove();
//wrapDiv.selectAll("svg").remove();
/*
var plotDiv = wrapDiv.append("div")
 .attr("class", "corrplot")
 .attr("id", "corrplot-1")

var svgHTML = '	<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><defs><linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#053061;stop-opacity:1" /><stop offset="50%" style="stop-color:#FFFFFF;stop-opacity:1" /><stop offset="100%" style="stop-color:#67001F;stop-opacity:1" /></linearGradient></defs></svg>'
//添加svg
wrapDiv.append("svg")
 .html(svgHTML)
*/
init_corrplot(method = method)
})
})


  },

  resize: function(el, width, height, instance) {
  }

});
