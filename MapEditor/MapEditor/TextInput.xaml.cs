using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace MapEditor
{
    /// <summary>
    /// Interaktionslogik für TextInput.xaml
    /// </summary>
    public partial class TextInput : Window
    {
        Action<string> Callback = null;

        public TextInput(Action<string> callback)
        {
            this.Callback = callback;

            InitializeComponent();

            this.InputText.Focus();

        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }

        private void Button_Click_1(object sender, RoutedEventArgs e)
        {
            this.Callback(this.InputText.Text);
            this.Close();
        }

        private void TextInput_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Return)
            {
                this.Callback(this.InputText.Text);
                this.Close();
            }
        }



    }
}
