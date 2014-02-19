using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;

using System.IO;

using Data;
using GraphicLibary;
using GraphicLibary.Controls;

namespace Animation_Creator
{
    public partial class Form1 : Form
    {

        GraphicHelper gr;
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
           


            if (stringList1.getContent().Length > 0)
            {
                List<string> list = new List<string>(stringList1.getContent().Length);


                int maxWidth = 0;
                int maxHeight = 0;

                List<Image> bilder = new List<Image>();

                foreach (StringList.StringListContainer line in stringList1.getContent())
                {
                    FileInfo info = new FileInfo(line.Name);

                    Image image = Image.FromStream(info.OpenRead());
                    list.Add(info.Name);

                    int width = image.Width;
                    int height = image.Height;

                    if (width > maxWidth)
                    {
                        maxWidth = width;
                    }

                    if (height > maxHeight)
                    {
                        maxHeight = height;
                    }

                    bilder.Add(image);

                }

                maxWidth += 2;
                maxHeight += 2;


                int count = bilder.Count;

                int rows = 1;
                int colums = count;


                GraphicHelper gr = new GraphicHelper(maxWidth * colums, maxHeight * rows);
                pictureBox1.Width = gr.Width;
                pictureBox1.Height = gr.Height;
                this.gr = gr;


                StringWriter writer = new StringWriter();
                int i = 0;

                foreach (Image image in bilder)
                {

                    int row = (int)Math.Floor((double)i / colums);
                    int colum = i % colums;

                    int posX = (colum * maxWidth);
                    int posY = (row * maxHeight);

                    writer.WriteLine(posX.ToString() + " - " + list[i]);

                    GraphicHelper tmp = new GraphicHelper(maxWidth, maxHeight, panel2.BackColor);

                    tmp.drawCenterImage(image);


                    gr.drawImage(tmp.flush(), posX, posY);


                    i++;
                }

                pictureBox1.Image = gr.flush();
                pictureBox1.Width = pictureBox1.Image.Width;

                frameH.Text = maxHeight.ToString();
                frameW.Text = maxWidth.ToString();

                InfoBox.Text = writer.ToString();

            }

        }

        private void button3_Click(object sender, EventArgs e)
        {
            OpenFileDialog dialog = new OpenFileDialog();
            dialog.Multiselect = true;
            dialog.Filter = "Bild Dateien | *.jpg;*.png";

            if (dialog.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {

                foreach (string file in dialog.FileNames)
                {
                    if (!stringList1.Contains(file))
                        stringList1.Add(file);
                }
            }


        }

        private void button2_Click(object sender, EventArgs e)
        {
            SaveFileDialog save = new SaveFileDialog();
            save.Filter = "Bild Datei | *.png";

            if (save.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {

                Image img = gr.flush();
                img.Save(save.FileName, System.Drawing.Imaging.ImageFormat.Png);

                if (saveInfo.Checked)
                {
                    FileStream FS = File.Open(save.FileName + ".txt", FileMode.Create);
                    StreamWriter writer = new StreamWriter(FS);

                    writer.Write(InfoBox.Text);

                    writer.Close();


                }


            }



        }

        private void button4_Click(object sender, EventArgs e)
        {
            ColorDialog dialog = new ColorDialog();

            if (dialog.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {
                panel2.BackColor = dialog.Color;
            }

        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }

        private void button5_Click(object sender, EventArgs e)
        {
            panel2.BackColor = Color.Transparent;
        }


    }
}
