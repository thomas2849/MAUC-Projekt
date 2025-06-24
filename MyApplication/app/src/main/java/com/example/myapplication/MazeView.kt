package com.example.myapplication
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.example.myapplication.ui.theme.MyApplicationTheme

override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)
}
data class Cell(
    val x: Int,
    val y: Int,
    val walls: Walls
)

data class Walls(
    val top: Boolean,
    val right: Boolean,
    val bottom: Boolean,
    val left: Boolean
)

class MazeView @JvmOverloads constructor(
    ctx: Context, attrs: AttributeSet? = null
) : View(ctx, attrs) {

    private var cells: List<Cell> = emptyList()
    private var cols = 0
    private var rows = 0

    private val paint = Paint().apply {
        strokeWidth = 4f
        style = Paint.Style.STROKE
    }

    fun setMaze(cells: List<Cell>) {
        this.cells = cells
        cols = cells.maxOfOrNull { it.x }?.plus(1) ?: 0
        rows = cells.maxOfOrNull { it.y }?.plus(1) ?: 0
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (cols == 0 || rows == 0) return

        val cellW = width.toFloat() / cols
        val cellH = height.toFloat() / rows

        for (cell in cells) {
            val leftX = cell.x * cellW
            val topY  = cell.y * cellH
            val rightX = leftX + cellW
            val bottomY = topY + cellH

            if (cell.walls.top)
                canvas.drawLine(leftX, topY, rightX, topY, paint)
            if (cell.walls.right)
                canvas.drawLine(rightX, topY, rightX, bottomY, paint)
            if (cell.walls.bottom)
                canvas.drawLine(leftX, bottomY, rightX, bottomY, paint)
            if (cell.walls.left)
                canvas.drawLine(leftX, topY, leftX, bottomY, paint)
        }
    }
}