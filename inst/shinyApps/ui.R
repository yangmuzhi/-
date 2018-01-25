
# shiny::runApp("E:/jian_guo/bfd_vis/inst/shinyApps/")
library(shiny)

load(system.file("shinyApps", "displayMatrix.RData",  package="bfdVis"))

sensorNameArray = colnames( displayMatrix)
shinyUI(
fluidPage(
  title = '铁科院项目结果演示',
  sidebarLayout(
    sidebarPanel(
      conditionalPanel(
        'input.dataset === "相关关系矩阵"',
        checkboxGroupInput('show_vars', 'Columns in corMatrix to show:',
                          sensorNameArray, selected =  sensorNameArray)
      ),
      conditionalPanel(
        'input.dataset === "Dashboard"',
        helpText('桥梁传感器展示 Dashboard')
      ),
      conditionalPanel(
        'input.dataset === "时序趋势"',
        helpText('图形3，时序')
      ),
	#submitButton("展示更新"),
	  width=2
    ),
    mainPanel(
      tabsetPanel(
        id = 'dataset',
        tabPanel('相关关系矩阵',
			bfdVis::corrplotOutput("corrplot")),
        tabPanel('Dashboard', DT::dataTableOutput('mytable2')),
        tabPanel('时序趋势', DT::dataTableOutput('mytable3'))
      )
    )
  )
)
)
# shiny::runApp("E:/jian_guo/bfd_vis/inst/shinyApps/")
