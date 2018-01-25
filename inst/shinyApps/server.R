library(shiny)

# Define server logic required to draw a histogram
shinyServer(function(input, output) {
	load(system.file("shinyApps", "displayMatrix.RData",  package="bfdVis"))

  # Expression that generates a histogram. The expression is
  # wrapped in a call to renderPlot to indicate that:
  #
  #  1) It is "reactive" and therefore should be automatically
  #     re-executed when inputs change
  #  2) Its output type is a plot

  output$corrplot <- bfdVis::renderCorrplot({
	selectedVars = input$show_vars
	displayMatrix = displayMatrix[, selectedVars]
	bfdVis::corrplotVis(cor(displayMatrix))

  })
  output$selection <- renderPrint(
    input$show_vars
  )
})