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

        public static Task<string> Display(string title = "Text Input", string defaultText = "")
        {

            var t = new TaskCompletionSource<string>();

            var input = new TextInput(s => t.TrySetResult(s), title, defaultText);
            input.Show();

            return t.Task;

        }

        public TextInput(Action<string> callback, string title = "Text Input", string defaultText = "")
        {
            InitializeComponent();

            this.Callback = callback;
            this.Title = title;

            this.InputText.Text = defaultText;
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

        private void Window_Closed(object sender, EventArgs e)
        {
            if (Callback != null)
            {
                Callback(null);
            }
        }
    }
}
